//make dashboard private route 
//arrowfunction with properites = racfp
import React from 'react'
import {Route,Redirect} from 'react-router-dom';
import PropTypes from 'prop-types'
import {connect} from 'react-redux';

//if not authenticated and not loading(means loading has got completed ) then redirect to login otherwise component will load 
const PrivateRoute = ({component:Component,auth:{isAuthenticated,loading},...rest})=>(
    <Route {...rest} render = {props =>!isAuthenticated && !loading ?(<Redirect to ='/login'/>):(<Component {...props}/>)}/>
)

PrivateRoute.propTypes = {
    auth:PropTypes.object.isRequired,
}

const mapStateToProps = state =>({
    auth:state.auth
})

export default connect(mapStateToProps)(PrivateRoute)
