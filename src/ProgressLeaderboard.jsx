import './ProgressLeaderboard.css';
import { supabase } from './supabaseClient';
import { useState, useEffect } from 'react';

async function getUsernameFromID(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        console.error("Error fetching username: ", error.message);
        return "Unknown User";
    }

    return data?.username || "Unknown User";
}

// leaderboard on a book landing page
function ProgressLeaderboard({ bookId}) {
    
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [usernames, setUsernames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaderboardData() {
            var usernamesTemp = [];
            setLoading(true);
            const { data, error } = await supabase
                .from('progress')
                .select('user_id, chapter')
                .eq('book_id', bookId)
                .order('chapter', { ascending: false })
                .limit(5);

            if (error) {
                console.error("Error fetching leaderboard data: ", error.message);
                setLoading(false);
                return;
            }

            for (const entry of data) {
                const username = await getUsernameFromID(entry.user_id);
                usernamesTemp.push(username);
            }

            setUsernames(usernamesTemp);

            if (usernamesTemp.length !== data?.length) {
                console.error("Mismatch in usernames and data lengths");
                setLoading(false);
                setUsernames([]);
                setLeaderboardData([]);
                return;
            }

            setLeaderboardData(data);
            setLoading(false);
        }

        fetchLeaderboardData();
        

    }, [bookId]);

    if (loading) {
        return (
            <div className='commentSectionBox lessBotPadding'>
                <h2 className='commentSectionHeader'>Leaderboard</h2>
                <div>Loading...</div>
            </div>
        )
    }

    return (
        <div className='commentSectionBox lessBotPadding'>
            <h2 className='commentSectionHeader'>Leaderboard</h2>
            {leaderboardData.length === 0 ? (
                <div>Nobody has made progress</div>
            ) : (
                <table>
                    <tbody>
                        {leaderboardData.map((entry, index) => (
                            <tr key={index}>
                                <td>{index + 1}.</td>
                                <td>{usernames[index]}</td>
                                <td>Chapter: {entry.chapter}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default ProgressLeaderboard;