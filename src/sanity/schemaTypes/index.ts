import { type SchemaTypeDefinition } from 'sanity'

import {blockContentType} from './blockContentType'
import {categoryType} from './categoryType'
import {authorType} from './authorType'
import {chatType} from './chatType'
import {postType} from './postType'
import {domainType} from './domainType'
import {domainAccessType} from './domainAccessType'

export const schema = {
  types: [blockContentType, categoryType, authorType, chatType, postType, domainType, domainAccessType] as SchemaTypeDefinition[],
}
