import './CommentSection.css'
import { supabase } from './supabaseClient';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CommentSection({ bookId, chapterNum, session }) {

    const navigate = useNavigate();

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);

    async function fetchComments() {
        setLoading(true);
        const { data, error } = await supabase
            .from('comments')
            .select('id, content, created_at, user_id, username')
            .eq('book_id', bookId)
            .eq('chapter', String(chapterNum))
            .order('created_at', { ascending: true });

        if (!error) setComments(data);
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
    
    return (
        <>
            <div className='commentSectionBox'>
                <h2 className='commentSectionHeader'>Comments</h2>
                <div className='commentSection'>
                    {session ? (
                        <div className='comment'>
                        <div className='commentDetails'>
                            <div className='commentUsername'>
                                {session.user.user_metadata?.username || 'Anonymous'}
                            </div>
                            <button
                                className='commentButton'
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
                            <div className='loginToLeaveCommentRow'>
                                <button onClick={() => navigate("/Login")} className='loginToLeaveComment'>Login</button>
                                <p style={{paddingBottom: "10px", paddingLeft: "78px"}}>to leave a comment.</p>
                            </div>
                        </div>
                    )}
                    {loading && <p style={{paddingBottom: "20px"}}>Loading comments...</p>}

                    {!loading && comments.length === 0 && (
                    <p style={{paddingBottom: "20px"}}>No comments yet — be the first!</p>
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
                                    {isOwner && !isEditing && (
                                        <>
                                            <button
                                                className='commentEditButton'
                                                onClick={() => startEditing(comment)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className='commentDeleteButton'
                                                onClick={() => handleDelete(comment.id)}
                                            >
                                                Delete
                                            </button>
                                            </>
                                    )}
                                </div>

                                {isEditing ? (
                                    <>
                                        <input
                                            className='addCommentInput'
                                            value={editText}
                                            placeholder='Add a comment...'
                                            onChange={(e) => setEditText(e.target.value)}
                                        />
                                        <div className='commentEditActions'>
                                            <button
                                                className='saveEditButton'
                                                onClick={() => handleSaveEdit(comment.id)}
                                                disabled={savingEdit}
                                            >
                                                {savingEdit ? 'Saving...' : 'Save'}
                                            </button>
                                            <button className='cancelEditButton' onClick={cancelEditing}>Cancel</button>
                                        </div>
                                    </>
                                ) : (
                                    <p>{comment.content}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    )
}

export default CommentSection;