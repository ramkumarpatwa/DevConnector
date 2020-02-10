//it is a functin that takes token if there will be token then it will add to header if not then it will delete from header 

import axios from 'axios';

const setAuthToken = token =>{
    if(token){
        axios.defaults.headers.common['x-auth-token']=token;
    } else {
        delete axios.defaults.headers.common['x-auth-token'];
    }
    
};

export default  setAuthToken;