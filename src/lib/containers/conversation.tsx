import * as React from "react"
import * as Relay from "react-relay"

import { MetadataText, SmallHeadline } from "../components/inbox/typography"

import { FlatList, ImageURISource, ViewProperties } from "react-native"

import styled from "styled-components/native"
import colors from "../../data/colors"
import ArtworkPreview from "../components/inbox/conversations/artwork_preview"
import Composer from "../components/inbox/conversations/composer"
import Message from "../components/inbox/conversations/message"
import ARSwitchBoard from "../native_modules/switch_board"

// tslint:disable-next-line:no-var-requires
const chevron: ImageURISource = require("../../../images/horizontal_chevron.png")

const Container = styled.View`
  flex: 1
  flexDirection: column
  marginLeft: 20
  marginRight: 20
`
const Header = styled.View`
  alignSelf: stretch
  marginTop: 10
  flexDirection: column
  marginBottom: 20
`

const HeaderTextContainer = styled.View`
  flexDirection: row
  justifyContent: space-between
`

const BackButtonPlaceholder = styled.Image`
  height: 12
  width: 7
  transform: rotate(180deg)
`

const DottedBorder = styled.View`
  height: 1
  borderWidth: 1
  borderStyle: dotted
  borderColor: ${colors["gray-regular"]}
`

const MessagesList = styled(FlatList)`
  marginTop: 10
`

export class Conversation extends React.Component<RelayProps, any> {
  isFromUser(message) {
    /**
     * this is a quick hacky way to alternate between user/partner messages; will be changed once we have actual email
     * data
     */
    return message.from_email_address === this.props.me.conversation.from.email
  }

  render() {
    const conversation = this.props.me.conversation
    const partnerName = conversation.to.name
    const artwork = conversation.artworks[0]
    const temporaryTimestamp = "11:00AM"

    // Ideally we will use a Relay fragment in the Message component, but for now this is good enough
    const messageData = conversation.messages.edges.reverse().map(({ node }, index) => {
      return {
        senderName: this.isFromUser(node) ? conversation.from.name : partnerName,
        key: index,
        time: temporaryTimestamp,
        body: node.snippet,
      }
    })

    return (
      <Container>
        <Header>
          <HeaderTextContainer>
            <BackButtonPlaceholder source={chevron} />
            <SmallHeadline>{partnerName}</SmallHeadline>
            <MetadataText>Info</MetadataText>
          </HeaderTextContainer>
        </Header>
        <ArtworkPreview
          artwork={artwork}
          onSelected={() => ARSwitchBoard.presentNavigationViewController(this, artwork.href)}
        />
        <MessagesList
          data={messageData}
          renderItem={messageProps => <Message message={messageProps.item} />}
          ItemSeparatorComponent={DottedBorder}
        />
        <Composer />
      </Container>
    )
  }
}

export default Relay.createContainer(Conversation, {
  initialVariables: {
    conversationID: null,
  },
  fragments: {
    me: () => Relay.QL`
      fragment on Me {
        conversation(id: $conversationID) {
          id
          from {
            name
            email
          }
          to {
            name
          }
          initial_message
          messages(first: 15) {
            edges {
              node {
                snippet
                from_email_address
              }
            }
          }
          artworks @relay (plural: true) {
            title
            artist_names
            href
            ${ArtworkPreview.getFragment("artwork")}
          }
        }
      }
    `,
  },
})

interface RelayProps {
  me: {
    conversation: {
      id: string
      from: {
        name: string
        email: string
      }
      to: {
        name: string
      }
      initial_message: string
      artworks: any[]
      messages: {
        pageInfo: {
          hasNextPage: boolean
        }
        edges: Array<
          {
            node: any | null
          }
        >
      }
    }
  }
}
