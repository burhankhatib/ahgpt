import {DocumentTextIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const domainType = defineType({
  name: 'domain',
  title: 'Domain',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
    }),
    defineField({
      name: 'url',
      type: 'url',
    }),
    defineField({
      name: 'mode',
      type: 'string',
      options: {
        list: ['whitelist', 'blacklist', 'disabled'],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({
      name: 'whitelist',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'blacklist',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'allowedTesting',
      type: 'boolean',
    }),
   
  ],
})
