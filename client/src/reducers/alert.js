import {SET_ALERT,REMOVE_ALERT} from '../actions/types';

const initialState = []

//action contain payload and type
export default function(state=initialState,action){
    //destructure here so that instead of using action.payload we can use payload directly 
    const {type,payload} = action;
    switch(type){//we can pass action.type
        case SET_ALERT:
            return [...state,payload];
        case REMOVE_ALERT:
            return state.filter(alert=>alert.id!==payload)
        default:
            return state;
    }
}