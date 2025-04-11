/**
 * Composables for working with external content embed URLs.
 */

type ServiceEmbedDef = {
  name: string,
  linkRegexPatterns: RegExp[],
}

const SUPPORTED_EMBEDS: {[service: string]: ServiceEmbedDef} & Object = {
  youtube: {
    name: 'YouTube',
    linkRegexPatterns: [
      RegExp(/http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/) // Source: https://stackoverflow.com/a/3726073,
    ],
  },
}

export const useMediaEmbeds = () => {
  return {
    /** Returns the ID of the service a URL corresponds to, if it's any of the supported ones. */
    getServiceType(url: string) {
      for (const [id, embedService] of Object.entries(SUPPORTED_EMBEDS)) {
        for (const pattern of embedService.linkRegexPatterns) {
          if (pattern.test(url)) {
            return id
          }
        }
      }
      return null
    },

    /** Extracts the content ID from a url. */
    getContentID(url: string) {
      for (const [id, embedService] of Object.entries(SUPPORTED_EMBEDS)) {
        for (const pattern of embedService.linkRegexPatterns) {
          const match = pattern.exec(url)
          if (match) {
            return match[1]
          }
        }
      }
      return null
    },

    /** Converts a URL to the service's iframe-compatible embed URL. */
    convertToEmbedURL(url: string) {
      const type = this.getServiceType(url)
      const contentID = this.getContentID(url)
      return this.getEmbedURL(type!, contentID!) || url
    },

    /** Constructs an iframe-compatible embed URL for a service. */
    getEmbedURL(service: string, contentID: string) {
      switch (service) {
        case 'youtube': {
          return `https://www.youtube.com/embed/${contentID}`
        }
      }
      return null
    },

    /** Constructs a user-friendly URL an from embed source. */
    getUserFriendlyURL(service: string, contentID: string) {
      switch (service) {
        case 'youtube': {
          return `https://www.youtube.com/watch?v=${contentID}`
        }
      }
      return null
    },
  }
}