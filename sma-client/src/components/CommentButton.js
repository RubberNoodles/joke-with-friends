import React from 'react';
import ChatBubbleRoundedIcon from '@material-ui/icons/ChatBubbleRounded';
import IconButton from '@material-ui/core/IconButton';

function CommentButton(props) {

    const onCommentClick = () => {
        return;
    }

    return(
        <IconButton onClick = {onCommentClick}>
            <ChatBubbleRoundedIcon/>
        </IconButton>
    )
};

export default CommentButton;