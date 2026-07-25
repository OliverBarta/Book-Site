import './CommentSection.css'
import { supabase } from './supabaseClient';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// the comment section code
function CommentSection({ bookId, chapterNum, session }) {

    const navigate = useNavigate();

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);

    const [userReactions, setUserReactions] = useState({}); // { [commentId]: 'like' | 'dislike' }

    async function fetchComments() {
        setLoading(true);
        const { data, error } = await supabase
            .from('comments')
            .select('id, content, created_at, user_id, username, likes, dislikes')
            .eq('book_id', bookId)
            .eq('chapter', String(chapterNum))
            .order('created_at', { ascending: true });

        if (!error) setComments(data);

        if (session && data?.length) {
            const { data: reactions } = await supabase
                .from('comment_reactions')
                .select('comment_id, reaction')
                .eq('user_id', session.user.id)
                .in('comment_id', data.map((c) => c.id));
    
            if (reactions) {
                const map = {};
                reactions.forEach((r) => { map[r.comment_id] = r.reaction; });
                setUserReactions(map);
            }
        }

        setLoading(false);
    }

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

    async function handlePostComment() {
        if (!newComment.trim() || !session) return;
        setPosting(true);
    
        const { error } = await supabase.from('comments').insert({
          user_id: session.user.id,
          book_id: bookId,
          chapter: String(chapterNum),
          content: newComment.trim(),
          username: session.user.user_metadata?.username,
        });
    
        if (!error) setNewComment('');
        setPosting(false);

        fetchComments();
    }

    function startEditing(comment) {
        setEditingId(comment.id);
        setEditText(comment.content);
    }

    function cancelEditing() {
        setEditingId(null);
        setEditText('');
    }

    async function handleSaveEdit(commentId) {
        if (!editText.trim()) return;
        setSavingEdit(true);

        const { error } = await supabase
            .from('comments')
            .update({ content: editText.trim() })
            .eq('id', commentId);

        setSavingEdit(false);

        if (!error) {
            setComments((prev) =>
                prev.map((c) =>
                    c.id === commentId ? { ...c, content: editText.trim() } : c
                )
            );
            setEditingId(null);
            setEditText('');
        }
        fetchComments();
    }

    async function handleDelete(commentId) {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId);

        if (!error) {
            setComments((prev) => prev.filter((c) => c.id !== commentId));
        }
        fetchComments();
    }

    // updates the database for the reaction
    async function handleReaction(commentId, reaction) {
        if (!session) return;
    
        const { data, error } = await supabase.rpc('toggle_reaction', {
            p_comment_id: commentId,
            p_reaction: reaction,
        });
    
        if (!error && data?.[0]) {
            const { new_likes: likes, new_dislikes: dislikes } = data[0];
            setComments((prev) =>
                prev.map((c) => (c.id === commentId ? { ...c, likes, dislikes } : c))
            );
            setUserReactions((prev) => {
                const wasSame = prev[commentId] === reaction;
                const next = { ...prev };
                if (wasSame) delete next[commentId];
                else next[commentId] = reaction;
                return next;
            });
        }
    }
    
    return (
        <>
            <div className='commentSectionBox'>
                <h2 className='commentSectionHeader'>Comments</h2>
                <div className='commentSection'>
                    {session ? (
                        <div className='commentBar'>
                            <div className='commentDetails'>
                                <div className='commentUsername'>
                                    {session.user.user_metadata?.username || 'Anonymous'}
                                </div>
                            </div>
                            <input
                                className='addCommentInput'
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                            />
                            <div className='commentActions'>
                                <button
                                        className='greyButton commentButton'
                                        onClick={handlePostComment}
                                        disabled={posting}
                                    >
                                        {posting ? 'Posting...' : 'Comment'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className='commentBar'>
                            <div className='loginToLeaveCommentRow'>
                                <button onClick={() => navigate("/Login")} className='loginToLeaveComment'>Login</button>
                                <p style={{paddingBottom: "10px", paddingLeft: "78px"}}>to leave a comment.</p>
                            </div>
                        </div>
                    )}
                    {loading && <p style={{paddingBottom: "20px"}}>Loading comments...</p>}

                    {!loading && comments.length === 0 && (
                    <p style={{paddingBottom: "20px"}}>No comments</p>
                    )}

                    {comments.map((comment) => {
                        const isOwner = session && comment.user_id === session.user.id;
                        const isEditing = editingId === comment.id;

                        return (
                            <div className='comment' key={comment.id}>
                                <div className='commentDetails'>
                                    <div className='commentUsername'>
                                        {comment.username || 'Anonymous'}
                                    </div>
                                    <div className='commentDate'>
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                {isEditing ? (
                                    <>
                                        <input
                                            className='addCommentInput'
                                            value={editText}
                                            placeholder='Add a comment...'
                                            onChange={(e) => setEditText(e.target.value)}
                                        />
                                        <div className='commentActions'>
                                            <button
                                                className='greyButton saveEditButton'
                                                onClick={() => handleSaveEdit(comment.id)}
                                                disabled={savingEdit}
                                            >
                                                {savingEdit ? 'Saving...' : 'Save'}
                                            </button>
                                            <button className='cancelEditButton greyButton' onClick={cancelEditing}>Cancel</button>
                                        </div>
                                    </>
                                ) : (
                                    <p>{comment.content}</p>
                                )}
                                <div className='commentActions'>
                                    {session && (
                                        <>
                                            <button
                                                className={`greyButton ${!isOwner ? 'greenHover' : 'cantPress'}`}
                                                onClick={!isOwner && (() => handleReaction(comment.id, 'like'))}
                                            >
                                                {comment.likes}
                                                <div style={{width: "5px"}}></div>
                                                <svg 
                                                    xmlns="http://www.w3.org/2000/svg" 
                                                    width="18" 
                                                    height="18" 
                                                    viewBox="0 0 24 24" 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    strokeWidth="2" 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round"
                                                    style={{ display: 'block' }}
                                                >
                                                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                                </svg>
                                            </button>
                                            <button
                                                className={`greyButton ${!isOwner ? 'redHover' : 'cantPress'}`}
                                                onClick={!isOwner && (() => handleReaction(comment.id, 'dislike'))}
                                            >
                                                {comment.dislikes}
                                                <div style={{width: "5px"}}></div>
                                                <svg 
                                                    xmlns="http://www.w3.org/2000/svg" 
                                                    width="18"
                                                    height="18"
                                                    viewBox="0 0 24 22" 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    strokeWidth="2" 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round"
                                                    style={{ display: 'block' }}
                                                >
                                                    <path d="M17 14V2" />
                                                    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                    {isOwner && !isEditing && (
                                        <>
                                            <button
                                                style={{marginLeft: "auto"}}
                                                className='commentEditButton greyButton'
                                                onClick={() => startEditing(comment)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className='commentDeleteButton greyButton'
                                                onClick={() => handleDelete(comment.id)}
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    )
}

export default CommentSection;