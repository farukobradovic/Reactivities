import { observer } from "mobx-react-lite";
import React from "react";
import { NavLink } from "react-router-dom";
import { Menu, Container, Button } from "semantic-ui-react";

const NavBar: React.FC = () => {
  return (
    <div>
      <Menu inverted fixed='top'>
        <Container>
          <Menu.Item header as={NavLink} exact to='/'>
            <img
              src='/assets/logo.png'
              alt='logo'
              style={{ marginRight: "10px" }}
            ></img>
            Reactivities
          </Menu.Item>
          <Menu.Item name='Activities' as={NavLink} to='/activities' />
          <Menu.Item>
            <Button
              as={NavLink}
              to='/createActivity'
              positive
              content='Create Activity'
            />
          </Menu.Item>
        </Container>
      </Menu>
    </div>
  );
};

export default observer(NavBar);
