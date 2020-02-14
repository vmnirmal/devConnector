import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux';

const Alert = ({alerts}) => alerts !== null && alerts.length > 0 && alerts.map(alert => (
        <div key={alert.id} className={`alert alert-${alert.alertType}`}>
            {alert.msg}
        </div>
    ));
// declare the alerts type (array)
Alert.propTypes = {
    alerts:PropTypes.array.isRequired,
}
// set state valu to mapStateToProps
//state.alert = alert (reducer) getting the alert reducer value and set to alerts json key
const mapStateToProps = state => ({
    alerts:state.alert
});

export default connect(mapStateToProps) (Alert);
