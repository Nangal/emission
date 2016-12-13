import 'react-native'
import React from 'react'
import RelatedArtists from '../'
import { renderWithLayout } from '../../../tests/renderWithLayout'

jest.mock('../../opaque_image_view.js', () => 'ImageView')

it('lays out correctly', () => {
  const artists = [ {
    __id: 0,
    name: 'Sarah Scott',
    counts: {
      for_sale_artworks: 2,
      artworks: 4,
    },
  }]

  const layout = { width: 768 }

  const component = renderWithLayout(<RelatedArtists artists={artists}/>, layout)
  expect(component).toMatchSnapshot()
})