import { useContext, useEffect, useState } from 'react';

import CommentList from './comment-list';
import NewComment from './new-comment';
import classes from './comments.module.css';
import NotificationContext from '../../store/notification-context';

function Comments(props) {
  const { eventId } = props;

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  const notificationCtx = useContext(NotificationContext);

  useEffect(() => {
    if (showComments) {
      setIsFetching(true);
      fetch(`/api/comments/${eventId}`)
      .then(response => response.json()
      .then(data => {
        setIsFetching(false);
        setComments(data.comments);
      }));
    }
  }, [showComments]);

  function toggleCommentsHandler() {
    setShowComments((prevStatus) => !prevStatus);
  }

  function addCommentHandler(commentData) {
    // send data to API
    notificationCtx.showNotification({
      title: 'Sending comment . . .',
      message: 'Your comment is currently being stored',
      status: 'pending'
    });
    fetch(`/api/comments/${eventId}`, {
      method: 'POST',
      body: JSON.stringify(commentData),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => {
      if (response.ok) {
        return response.json();
      }
      return response.json().then(data => {
        throw new Error(data.message || 'Something went wrong')
      });
    })
    .then(data => {
      notificationCtx.showNotification({
        title: 'Success!',
        message: 'Comment added successfully',
        status: 'success'
      })
    })
    .catch(err => {
      notificationCtx.showNotification({
        title: 'Error!',
        message: err.message || 'Failed to add comment',
        status: 'error'
      });
    });
  }

  return (
    <section className={classes.comments}>
      <button onClick={toggleCommentsHandler}>
        {showComments ? 'Hide' : 'Show'} Comments
      </button>
      {showComments && <NewComment onAddComment={addCommentHandler} />}
      {showComments && !isFetching && <CommentList items={comments} />}
      {showComments && isFetching && <p>Loading . . . </p>}
    </section>
  );
}

export default Comments;
