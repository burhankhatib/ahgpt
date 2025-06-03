import { createClient } from 'next-sanity'
import { dataset, projectId, apiVersion } from '../env'

const token = process.env.SANITY_API_TOKEN

// Debug token configuration
console.log('Sanity token configuration:', {
  hasToken: !!token,
  projectId,
  dataset,
  apiVersion
})

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
  perspective: 'published',
  stega: false
})
