//here we will be going to fetch all data using action and bring from redux state and then pass to other component for instane eduation or experienc e

//racfp=arrow functon with proptype shortcut
import React,{useEffect, Fragment} from 'react'
import {Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Spinner from '../layout/Spinner'
import {getCurrentProfile} from '../../actions/profile';

const Dashboard = ({getCurrentProfile,auth:{user},profile:{profile,loading}}) => {
    useEffect(()=>{
        getCurrentProfile()
    },[]);
    //if profile is null and is still laoding then dispalay loaidng gif 
    return loading && profile===null ?<Spinner/>:<Fragment>
    <h1 className="large text-primary">Dashboard</h1>  
    <p className='lead'>
    <i className="fas fa-user"/>Welcome {user&&user.name}
    </p>
    {profile !==null ? <Fragment>has</Fragment>:<Fragment><p>You have not yet setup a profile , Please add some info </p><Link to ='/create-profile' className="btn btn-primary my-1">Create Profile</Link></Fragment>}
    </Fragment>;
}

Dashboard.propTypes = {
    getCurrentProfile:PropTypes.func.isRequired,
    auth:PropTypes.object.isRequired,
    profile:PropTypes.object.isRequired,
}

const mapStateToProps = state =>({
    auth:state.auth,
    profile:state.profile
})

export default connect(mapStateToProps,{getCurrentProfile})(Dashboard)
