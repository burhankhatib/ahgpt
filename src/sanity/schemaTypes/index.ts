import { type SchemaTypeDefinition } from 'sanity'

import {blockContentType} from './blockContentType'
import {categoryType} from './categoryType'
import {authorType} from './authorType'
import {chatType} from './chatType'
import {postType} from './postType'

export const schema = {
  types: [blockContentType, categoryType, authorType, chatType, postType] as SchemaTypeDefinition[],
}
