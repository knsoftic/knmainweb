'use client';

import { useState, useEffect } from 'react';

import { apiUrl } from '../../utils/api-url';

interface LikeButtonProps {
  postId: number;
  initialLikes: number;
}

export default function LikeButton({ postId, initialLikes }: LikeButtonProps) {
  const storageKey = `liked_post_${postId}`;
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialLikes);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLiked(localStorage.getItem(storageKey) === '1');
    }
  }, [storageKey]);

  const handleLike = async () => {
    if (liked || animating) return;

    setAnimating(true);
    setLiked(true);
    setCount((c) => c + 1);
    localStorage.setItem(storageKey, '1');

    try {
      await fetch(apiUrl(`/blog/posts/${postId}/like`), {
        method: 'POST',
      });
    } catch {
      // silently ignore
    }

    setTimeout(() => setAnimating(false), 600);
  };

  return (
    <>
      <button
        onClick={handleLike}
        disabled={liked}
        className={`like-btn${liked ? ' liked' : ''}`}
        title={liked ? 'You liked this post!' : 'Like this post'}
      >
        <i
          className={`fa ${liked ? 'fa-heart' : 'fa-heart-o'}`}
          style={{
            fontSize: '1rem',
            transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
            transform: animating ? 'scale(1.5)' : 'scale(1)',
            display: 'inline-block',
          }}
        />
        <span>{count} {count === 1 ? 'Like' : 'Likes'}</span>
      </button>

      <style>{`
        .like-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          border-radius: 50px;
          border: 2px solid rgba(122, 106, 216, 0.35);
          background: transparent;
          color: #7a6ad8;
          font-weight: 700;
          font-size: 0.92rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
          outline: none;
          user-select: none;
          letter-spacing: 0.2px;
        }
        .like-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #8D18D0, #3930C7);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 8px 22px rgba(122, 106, 216, 0.4);
          transform: translateY(-2px);
        }
        .like-btn.liked {
          background: linear-gradient(135deg, #8D18D0, #3930C7);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 8px 22px rgba(122, 106, 216, 0.35);
          cursor: default;
        }
      `}</style>
    </>
  );
}
