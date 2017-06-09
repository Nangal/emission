import { storiesOf } from "@storybook/react-native"
import * as React from "react"
import * as Relay from "react-relay/classic"

import Routes from "../../relay/routes"
import MyAccount from "../my_account"

storiesOf("My Account").add("Root", () => {
  const profileRoute = new Routes.MyAccount()
  return <Relay.RootContainer Component={MyAccount} route={profileRoute} />
})
