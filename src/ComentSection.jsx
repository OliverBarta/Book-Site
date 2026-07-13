import './CommentSection.css'
import { supabase } from './supabaseClient';
import { useState, useEffect } from 'react';

function CommentSection({ bookId, chapterNum, session }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);

    useEffect(() => {
    fetchComments();
        const channel = supabase
            .channel(`comments-${bookId}-${chapterNum}`)
            .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'comments',
            filter: `book_id=eq.${bookId}`,
            }, (payload) => {
            if (payload.new.chapter === String(chapterNum)) {
                setComments((prev) => [...prev, payload.new]);
            }
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [bookId, chapterNum]);

    async function fetchComments() {
        setLoading(true);
        const { data, error } = await supabase
            .from('comments')
            .select('id, content, created_at, user_id, profiles(username)')
            .eq('book_id', bookId)
            .eq('chapter', String(chapterNum))
            .order('created_at', { ascending: true });

        if (!error) setComments(data);
        setLoading(false);
    }

    async function handlePostComment() {
        if (!newComment.trim() || !session) return;
        setPosting(true);
    
        const { error } = await supabase.from('comments').insert({
          user_id: session.user.id,
          book_id: bookId,
          chapter: String(chapterNum),
          content: newComment.trim(),
        });
    
        if (!error) setNewComment('');
        setPosting(false);
    }
    
    return (
        <>
            <div className='commentSectionBox'>
                <h2 className='commentSectionHeader'>Comments</h2>
                <div className='commentSection'>
                    {session ? (
                        <div className='comment'>
                        <div className='commentDetails'>
                            <div className='commentUsername'>
                            {session.user.email}
                            </div>
                            <button
                            className='commentDate'
                            onClick={handlePostComment}
                            disabled={posting}
                            >
                            {posting ? 'Posting...' : 'Comment'}
                            </button>
                        </div>
                        <input
                            className='addCommentInput'
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                        />
                        </div>
                    ) : (
                        <div className='comment'>
                        <p>Sign in to leave a comment.</p>
                        </div>
                    )}
                    {loading && <p>Loading comments...</p>}

                    {!loading && comments.length === 0 && (
                    <p>No comments yet — be the first!</p>
                    )}

                    {comments.map((comment) => (
                    <div className='comment' key={comment.id}>
                        <div className='commentDetails'>
                        <div className='commentUsername'>
                            {comment.profiles?.username || 'Anonymous'}
                        </div>
                        <div>|</div>
                        <div className='commentDate'>
                            {new Date(comment.created_at).toLocaleDateString()}
                        </div>
                        </div>
                        <p>{comment.content}</p>
                    </div>
                    ))}
                    
                </div>
            </div>
        </>
    )
}

export default CommentSection;