import {defineType} from 'sanity'

export const chatType = defineType({
  name: 'chat',
  title: 'Chat',
  type: 'document',
  fields: [
      {
          name: 'uniqueKey',
          title: 'Unique Key',
          type: 'string',
          validation: Rule => Rule.required(),
      },
      {
          name: 'user',
          title: 'User',
          type: 'object',
          validation: Rule => Rule.required(),
          fields: [
              {
                  name: 'firstName',
                  title: 'First Name',
                  type: 'string',
                  validation: Rule => Rule.required(),
              },
              {
                  name: 'lastName',
                  title: 'Last Name',
                  type: 'string',
              },
              {
                  name: 'email',
                  title: 'Email',
                  type: 'string',
                  validation: Rule => Rule.required().email(),
              },
              {
                  name: 'clerkId',
                  title: 'Clerk ID',
                  type: 'string',
                  validation: Rule => Rule.required(),
              }
          ]
      },
      {
          name: 'title',
          title: 'Title',
          type: 'string',
          validation: Rule => Rule.required(),
      },
      {
          name: 'messages',
          title: 'Messages',
          type: 'array',
          validation: Rule => Rule.required().min(1),
          of: [
              {
                  type: 'object',
                  fields: [
                      {
                          name: 'role',
                          title: 'Role',
                          type: 'string',
                          validation: Rule => Rule.required(),
                          options: {
                              list: [
                                  { title: 'User', value: 'user' },
                                  { title: 'Assistant', value: 'assistant' }
                              ]
                          }
                      },
                      {
                          name: 'content',
                          title: 'Content',
                          type: 'text',
                          validation: Rule => Rule.required(),
                      },
                      {
                          name: 'timestamp',
                          title: 'Timestamp',
                          type: 'datetime',
                          validation: Rule => Rule.required(),
                      },
                      {
                          name: 'uniqueKey',
                          title: 'Unique Key',
                          type: 'string',
                          validation: Rule => Rule.required(),
                      }
                  ]
              }
          ]
      },
      {
          name: 'analytics',
          title: 'Analytics',
          type: 'object',
          fields: [
              {
                  name: 'viewCount',
                  title: 'View Count',
                  type: 'number',
                  initialValue: 0
              },
              {
                  name: 'exportCount',
                  title: 'Export Count',
                  type: 'number',
                  initialValue: 0
              },
              {
                  name: 'lastViewedAt',
                  title: 'Last Viewed At',
                  type: 'datetime'
              }
          ]
      },
      {
          name: 'createdAt',
          title: 'Created At',
          type: 'datetime',
          validation: Rule => Rule.required(),
      },
      {
          name: 'updatedAt',
          title: 'Updated At',
          type: 'datetime',
          validation: Rule => Rule.required(),
      },
      {
          name: 'tags',
          title: 'Tags',
          type: 'array',
          of: [{ type: 'string' }]
      },
      {
          name: 'language',
          title: 'Language',
          type: 'string',
          options: {
              list: [
                  { title: 'English', value: 'en' },
                  { title: 'Arabic', value: 'ar' },
                  { title: 'Hebrew', value: 'he' }
              ]
          }
      }
  ],
  preview: {
      select: {
          title: 'title',
          subtitle: 'user.email',
          media: 'user.firstName'
      },
      prepare(selection) {
          const { title, subtitle } = selection
          return {
              title: title || 'Untitled Chat',
              subtitle: subtitle || 'Unknown User'
          }
      }
  }
})
