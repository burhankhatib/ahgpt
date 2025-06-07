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
          name: 'detectedLanguage',
          title: 'Detected Language',
          type: 'string',
          description: 'Auto-detected language using Franc from user messages',
          readOnly: false,
          options: {
              list: [
                  { title: 'English', value: 'en' },
                  { title: 'Arabic', value: 'ar' },
                  { title: 'Persian', value: 'fa' },
                  { title: 'Hebrew', value: 'he' },
                  { title: 'Chinese', value: 'zh' },
                  { title: 'Hindi', value: 'hi' },
                  { title: 'Spanish', value: 'es' },
                  { title: 'French', value: 'fr' },
                  { title: 'Bengali', value: 'bn' },
                  { title: 'Portuguese', value: 'pt' },
                  { title: 'Russian', value: 'ru' },
                  { title: 'Indonesian', value: 'id' },
                  { title: 'Urdu', value: 'ur' },
                  { title: 'German', value: 'de' },
                  { title: 'Japanese', value: 'ja' },
                  { title: 'Turkish', value: 'tr' },
                  { title: 'Korean', value: 'ko' },
                  { title: 'Vietnamese', value: 'vi' },
                  { title: 'Telugu', value: 'te' },
                  { title: 'Marathi', value: 'mr' },
                  { title: 'Tamil', value: 'ta' },
                  { title: 'Thai', value: 'th' },
                  { title: 'Balochi', value: 'bal' },
                  { title: 'Malay', value: 'ms' },
                  { title: 'Finnish', value: 'fi' },
                  { title: 'Swedish', value: 'sv' },
                  { title: 'Norwegian', value: 'no' },
                  { title: 'Danish', value: 'da' }
              ]
          }
      },
      {
          name: 'location',
          title: 'User Location',
          type: 'object',
          description: 'Auto-detected user location information',
          fields: [
              {
                  name: 'latitude',
                  title: 'Latitude',
                  type: 'number',
                  description: 'Geographic latitude coordinate'
              },
              {
                  name: 'longitude',
                  title: 'Longitude',
                  type: 'number',
                  description: 'Geographic longitude coordinate'
              },
              {
                  name: 'city',
                  title: 'City',
                  type: 'string',
                  description: 'City name'
              },
              {
                  name: 'region',
                  title: 'Region/State',
                  type: 'string',
                  description: 'Region or state name'
              },
              {
                  name: 'country',
                  title: 'Country',
                  type: 'string',
                  description: 'Country name'
              },
              {
                  name: 'timezone',
                  title: 'Timezone',
                  type: 'string',
                  description: 'User timezone identifier'
              },
              {
                  name: 'ip',
                  title: 'IP Address',
                  type: 'string',
                  description: 'User IP address'
              },
              {
                  name: 'source',
                  title: 'Location Source',
                  type: 'string',
                  description: 'How the location was detected',
                  options: {
                      list: [
                          { title: 'Browser Geolocation', value: 'geolocation' },
                          { title: 'IP Address', value: 'ip' },
                          { title: 'Unknown', value: 'unknown' }
                      ]
                  }
              }
          ]
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
