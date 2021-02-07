import React from 'react';
import ChatBubbleRoundedIcon from '@material-ui/icons/ChatBubbleRounded';
import IconButton from '@material-ui/core/IconButton';

const CommentButton: React.FC = () => {

    const onCommentClick = () => {
        return;
    }

    return (
        <IconButton onClick={onCommentClick}>
            <ChatBubbleRoundedIcon />
        </IconButton>
    )
};

export default CommentButton;