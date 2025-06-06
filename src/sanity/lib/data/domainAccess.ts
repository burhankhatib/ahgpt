import { client } from '../client'

export interface DomainAccessConfig {
  _id?: string
  mode: 'whitelist' | 'blacklist' | 'disabled'
  whitelist: string[]
  blacklist: string[]
  allowedTesting: boolean
  lastUpdated?: string
}

const DOMAIN_ACCESS_CONFIG_ID = 'domainAccessConfig'

// Get domain access configuration
export async function getDomainAccessConfig(): Promise<DomainAccessConfig> {
  try {
    const config = await client.fetch(
      `*[_type == "domainAccess" && _id == $id][0]{
        _id,
        mode,
        whitelist,
        blacklist,
        allowedTesting,
        lastUpdated
      }`,
      { id: DOMAIN_ACCESS_CONFIG_ID }
    )

    if (config) {
      return {
        _id: config._id,
        mode: config.mode || 'blacklist',
        whitelist: config.whitelist || ['alhayatgpt.com', 'www.alhayatgpt.com', 'localhost', '127.0.0.1'],
        blacklist: config.blacklist || ['example-blocked-site.com', 'spam-website.net', 'unauthorized-domain.org'],
        allowedTesting: config.allowedTesting !== false,
        lastUpdated: config.lastUpdated,
      }
    }

    // If no config exists, create default one
    return await createDefaultDomainAccessConfig()
  } catch (error) {
    console.error('Error fetching domain access config:', error)
    // Return default config as fallback
    return {
      mode: 'blacklist',
      whitelist: ['alhayatgpt.com', 'www.alhayatgpt.com', 'localhost', '127.0.0.1'],
      blacklist: ['example-blocked-site.com', 'spam-website.net', 'unauthorized-domain.org'],
      allowedTesting: true,
    }
  }
}

// Create default domain access configuration
export async function createDefaultDomainAccessConfig(): Promise<DomainAccessConfig> {
  try {
    const defaultConfig = {
      _id: DOMAIN_ACCESS_CONFIG_ID,
      _type: 'domainAccess',
      title: 'SDK Domain Access Control',
      mode: 'blacklist',
      whitelist: ['alhayatgpt.com', 'www.alhayatgpt.com', 'localhost', '127.0.0.1'],
      blacklist: ['example-blocked-site.com', 'spam-website.net', 'unauthorized-domain.org'],
      allowedTesting: true,
      lastUpdated: new Date().toISOString(),
    }

    const result = await client.createOrReplace(defaultConfig)
    
    return {
      _id: result._id,
      mode: result.mode as 'whitelist' | 'blacklist' | 'disabled',
      whitelist: result.whitelist,
      blacklist: result.blacklist,
      allowedTesting: result.allowedTesting,
      lastUpdated: result.lastUpdated,
    }
  } catch (error) {
    console.error('Error creating default domain access config:', error)
    throw error
  }
}

// Update domain access configuration
export async function updateDomainAccessConfig(config: Partial<DomainAccessConfig>): Promise<DomainAccessConfig> {
  try {
    const existingConfig = await getDomainAccessConfig()
    
    const updatedConfig = {
      _id: DOMAIN_ACCESS_CONFIG_ID,
      _type: 'domainAccess',
      title: 'SDK Domain Access Control',
      mode: config.mode || existingConfig.mode,
      whitelist: config.whitelist || existingConfig.whitelist,
      blacklist: config.blacklist || existingConfig.blacklist,
      allowedTesting: config.allowedTesting !== undefined ? config.allowedTesting : existingConfig.allowedTesting,
      lastUpdated: new Date().toISOString(),
    }

    const result = await client.createOrReplace(updatedConfig)
    
    return {
      _id: result._id,
      mode: result.mode as 'whitelist' | 'blacklist' | 'disabled',
      whitelist: result.whitelist,
      blacklist: result.blacklist,
      allowedTesting: result.allowedTesting,
      lastUpdated: result.lastUpdated,
    }
  } catch (error) {
    console.error('Error updating domain access config:', error)
    throw error
  }
}

// Add domain to whitelist or blacklist
export async function addDomainToList(domain: string, listType: 'whitelist' | 'blacklist'): Promise<DomainAccessConfig> {
  try {
    const config = await getDomainAccessConfig()
    const cleanDomain = domain.toLowerCase().trim()

    if (listType === 'whitelist' && !config.whitelist.includes(cleanDomain)) {
      config.whitelist.push(cleanDomain)
    } else if (listType === 'blacklist' && !config.blacklist.includes(cleanDomain)) {
      config.blacklist.push(cleanDomain)
    }

    return await updateDomainAccessConfig(config)
  } catch (error) {
    console.error('Error adding domain to list:', error)
    throw error
  }
}

// Remove domain from whitelist or blacklist
export async function removeDomainFromList(domain: string, listType: 'whitelist' | 'blacklist'): Promise<DomainAccessConfig> {
  try {
    const config = await getDomainAccessConfig()
    const cleanDomain = domain.toLowerCase().trim()

    if (listType === 'whitelist') {
      config.whitelist = config.whitelist.filter(d => d !== cleanDomain)
    } else if (listType === 'blacklist') {
      config.blacklist = config.blacklist.filter(d => d !== cleanDomain)
    }

    return await updateDomainAccessConfig(config)
  } catch (error) {
    console.error('Error removing domain from list:', error)
    throw error
  }
} 