import * as Relay from 'react-relay'
import * as React from 'react'
import { StyleSheet, View, Text, TouchableWithoutFeedback, NativeModules, ViewProperties } from 'react-native'
const { ARTemporaryAPIModule } = NativeModules

import colors from '../../../../data/colors'
import ImageView from '../../opaque_image_view'
import SwitchBoard from '../../../native_modules/switch_board'
import InvertedButton from '../../buttons/inverted_button'
import Events from '../../../native_modules/events'

interface Props extends ViewProperties, RelayProps {
  onFollow?: (any) => void
}

interface State {
    processingChange: boolean
    following?: boolean
    followStatusChanged?: boolean
}

class ArtistCard extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      processingChange: false,
      followStatusChanged: null,
      following: null
    }
  }

  handleTap() {
    SwitchBoard.presentNavigationViewController(this, this.props.artist.href)
  }

  handleFollowChange = () => {
    this.setState({ processingChange: true })

    ARTemporaryAPIModule.setFollowArtistStatus(true, this.props.artist._id, (error, following) => {
      if (error) {
        console.error(error)
        this.setState({ processingChange: false })
      } else {
        Events.postEvent(this, {
          name: 'Follow artist',
          artist_id: this.props.artist._id,
          artist_slug: this.props.artist.id,
          // TODO At some point, this component might be on other screens.
          source_screen: 'home page',
        })
        this.props.onFollow(this.setFollowStatus)
      }
    })
  }

  setFollowStatus = (status: boolean) => {
    // $FlowFixMe: We don't know how to get this the followStatusChanged to be the right type.
    return new Promise((followStatusChanged: boolean) => {
      this.setState({
        following: status,
        processingChange: false,
        followStatusChanged
      })
    })
  }

  renderMetadata() {
    const artist = this.props.artist
    const lines = []

    lines.push(
      <Text key={1} numberOfLines={1} style={styles.sansSerifText}>
        {artist.name.toUpperCase()}
      </Text>
    )

    if (artist.formatted_nationality_and_birthday) {
      lines.push(
        <Text key={2} numberOfLines={1} style={styles.serifText}>
          {artist.formatted_nationality_and_birthday}
        </Text>
      )
    }

    if (artist.formatted_artworks_count) {
      lines.push(
        <Text key={3} numberOfLines={1} style={[styles.serifText, styles.serifWorksText]}>
          {artist.formatted_artworks_count}
        </Text>
      )
    }

    return lines
  }

  render() {
    const artist = this.props.artist
    const imageURL = artist.image && artist.image.url

    const selectionAnimationFinishedHandler = this.state.followStatusChanged
    this.state.followStatusChanged = null

    return (
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={this.handleTap.bind(this)}>
          <View style={styles.touchableContainer}>
            <ImageView style={styles.image} imageURL={imageURL} />
            <View style={styles.textContainer}>
              {this.renderMetadata()}
            </View>
            <View style={styles.followButton}>
              <InvertedButton text={this.state.following ? 'Following' : 'Follow'}
                              selected={this.state.following}
                              onPress={this.handleFollowChange}
                              inProgress={this.state.processingChange}
                              onSelectionAnimationFinished={selectionAnimationFinishedHandler} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    )
  }
}

interface Styles {
  container: ReactNative.ViewStyle,
  sansSerifText: ReactNative.TextStyle,
  serifText: ReactNative.TextStyle,
  touchableContainer: ReactNative.ViewStyle,
  image: ReactNative.ViewStyle,
  textContainer: ReactNative.ViewStyle,
  serifWorksText: ReactNative.TextStyle,
  followButton: ReactNative.ViewStyle,
}

const styles = StyleSheet.create<Styles>({
  // TODO The outer wrapping view is currently only there because setting `marginLeft: 16` on the Artist card from the
  //      ArtistRail component isn’t working.
  container: {
    width: 236,
    height: 310,
  },
  touchableContainer: {
    width: 220,
    height: 280,
    marginLeft: 16,
    borderColor: '#F3F3F3',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {
      height: 2,
      width: 0
    }

  },
  image: {
    width: 196,
    height: 148,
    marginTop: 12,
    marginLeft: 12,
  },
  textContainer: {
    marginLeft: 12,
    marginTop: 12,
  },
  sansSerifText: {
    marginRight: 12,
    height: 17,
    fontSize: 12,
    textAlign: 'left',
    fontFamily: 'Avant Garde Gothic ITCW01Dm',
  },
  serifText: {
    marginRight: 12,
    height: 17,
    fontFamily: 'AGaramondPro-Regular',
    fontSize: 16,
    color: '#000000'
  },
  serifWorksText: {
    color: colors['gray-semibold'],
  },
  followButton: {
    marginTop: 12,
    marginLeft: 12,
    width: 196,
    height: 30,
    position: 'absolute',
    bottom: 15
  }
})

const ArtistCardContainer = Relay.createContainer(ArtistCard, {
  fragments: {
    artist: () => Relay.QL`
      fragment on Artist {
        id
        _id
        href
        name
        formatted_artworks_count
        formatted_nationality_and_birthday
        image {
          url(version: "large")
        }
      }
    `,
  }
})

// TODO Until we figure out how to use Relay to fetch/render suggested artists and replace initially suggested cards,
//      this query is duplicated so we can fetch the data manually.
export const ArtistCardQuery = `
  ... on Artist {
    id
    _id
    href
    name
    formatted_artworks_count
    formatted_nationality_and_birthday
    image {
      url(version: "large")
    }
  }
`

export default ArtistCardContainer

interface RelayProps {
  artist: {
    id: string,
    _id: string,
    href: string | null,
    name: string | null,
    formatted_artworks_count: string | null,
    formatted_nationality_and_birthday: string | null,
    image: {
      url: string | null,
    } | null,
  },
}
