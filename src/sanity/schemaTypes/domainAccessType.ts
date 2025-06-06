import { ControlsIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const domainAccessType = defineType({
  name: 'domainAccess',
  title: 'Domain Access Control',
  type: 'document',
  icon: ControlsIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Configuration Name',
      type: 'string',
      initialValue: 'SDK Domain Access Control',
      readOnly: true,
    }),
    defineField({
      name: 'mode',
      title: 'Access Control Mode',
      type: 'string',
      options: {
        list: [
          { title: 'Whitelist (Only allowed domains)', value: 'whitelist' },
          { title: 'Blacklist (Block specific domains)', value: 'blacklist' },
          { title: 'Disabled (Allow all domains)', value: 'disabled' }
        ],
        layout: 'radio',
      },
      initialValue: 'blacklist',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'whitelist',
      title: 'Whitelist Domains',
      description: 'Domains that are allowed to access the SDK (used in whitelist mode)',
      type: 'array',
      of: [{ type: 'string' }],
      initialValue: ['alhayatgpt.com', 'www.alhayatgpt.com', 'localhost', '127.0.0.1'],
    }),
    defineField({
      name: 'blacklist',
      title: 'Blacklist Domains',
      description: 'Domains that are blocked from accessing the SDK (used in blacklist mode)',
      type: 'array',
      of: [{ type: 'string' }],
      initialValue: ['example-blocked-site.com', 'spam-website.net', 'unauthorized-domain.org'],
    }),
    defineField({
      name: 'allowedTesting',
      title: 'Allow Testing Domains',
      description: 'Allow localhost and development domains for testing',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      mode: 'mode',
      lastUpdated: 'lastUpdated',
    },
    prepare(selection) {
      const { title, mode, lastUpdated } = selection
      return {
        title: title || 'Domain Access Control',
        subtitle: `Mode: ${mode || 'Not set'} | Updated: ${lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'Never'}`,
      }
    },
  },
}) 