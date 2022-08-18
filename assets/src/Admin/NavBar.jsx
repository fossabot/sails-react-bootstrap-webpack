import React from 'react';
import PropTypes from 'prop-types';

import {Nav, Navbar, Button} from 'react-bootstrap';
import {NavLink as ReactNavLink} from 'react-router-dom';

import {UserConsumer} from '../data/userContext';

class NavBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isExpanded: false
        };

        this.closeNavbar = this.closeNavbar.bind(this);
    }

    closeNavbar() {
        this.setState({isExpanded: false});
    }

    render() {
        return (
            <Navbar
                bg="dark"
                variant="dark"
                expand="sm"
                sticky="top"
                className="mb-3 ps-3 pe-3"
                expanded={this.state.isExpanded}
                onToggle={() => this.setState((current) => ({isExpanded: !current.isExpanded}))}
            >
                <Navbar.Brand>My App</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={ReactNavLink} to="/admin/dashboard" onClick={this.closeNavbar}>Home</Nav.Link>
                        <Nav.Link as={ReactNavLink} to="/admin/upgrade" onClick={this.closeNavbar}>Upgrade</Nav.Link>
                    </Nav>

                    <UserConsumer>
                        {
                            (userContext) => (
                                userContext.isLoggedIn &&
                                <Button variant="danger" onClick={() => this.props.handleLogout()} size="sm" className="mt-2 mt-sm-0 mb-2 mb-sm-0">Logout</Button>
                            )
                        }
                    </UserConsumer>
                </Navbar.Collapse>
            </Navbar>
        );
    }
}

NavBar.propTypes = {
    handleLogout: PropTypes.func.isRequired
};

export default NavBar;
