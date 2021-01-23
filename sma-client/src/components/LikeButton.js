import React from 'react';
import axios from 'axios';

// MUI Imports
import IconButton from '@material-ui/core/IconButton';
import { Favorite, RadioButtonChecked } from '@material-ui/icons';

function LikeButton(props) {

    const onLikeClick = () => {
        /*
        props.isLiked ? (
            axios.post(`/like/${props.id}`)
            .then(res => {
                return;
            })
        ) : (return;);
        */
        return;
    }

    return (
        <IconButton onClick = {onLikeClick}>
            { props.isLiked || false ? <RadioButtonChecked/> 
            : ( <Favorite/>)
            }
        </IconButton>
        
    )
};

export default LikeButton