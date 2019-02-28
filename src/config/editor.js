import { IFRAMELY_API_ENDPOINT, VALIDATE_URL_REGEXP } from '@/utils/constant'

// mediaEmbed
export function providers(domain, iframelyApiKey) {
  return [
    {
      name: 'twitter',
      url: /^twitter\.com/,
      html: (match) => {
        const path = match['input']
        const isTweet = path.split('/')[2] === 'status'
        const iframeUrl = `${IFRAMELY_API_ENDPOINT}?app=1&api_key=${iframelyApiKey}&url=${encodeURIComponent(
          path
        )}`
        if (isTweet) {
          return iframelyEmbedTemplate(iframeUrl)
        }
        const userName = path.split('/')[1]
        return `<div class="iframe-twitter">
                   <iframe src="https://${domain}/media_embed/twitter_profile/${userName}"
                   frameborder="0" allow="autoplay; encrypted-media" allowfullscreen class="twitter-content-area">
                   </iframe>
                 </div>`
      }
    },
    {
      name: 'facebook',
      url: [
        /^https?:\/\/(?:www|m|business)\.facebook\.com\/(permalink|story)\.php\?[^/]+(\d{10,})/i,
        /^https?:\/\/(?:www|m|business)\.facebook\.com\/photo\.php\?fbid=(\d{10,})/i,
        /^https?:\/\/(?:www|m|business)\.facebook\.com\/([a-zA-Z0-9.-]+)\/(posts|activity)\/(\d{10,})/i,
        /^https?:\/\/(?:www|m|business)\.facebook\.com\/([a-zA-Z0-9.-]+)\/photos\/[^/]+\/(\d{10,})/i,
        /^https?:\/\/(?:www|m|business)\.facebook\.com\/notes\/([a-zA-Z0-9.-]+)\/[^/]+\/(\d{10,})/i,
        /^https?:\/\/(?:www|m|business)\.facebook\.com\/media\/set\/\?set=[^/]+(\d{10,})/i
      ],
      html: (match) => {
        const path = match['input']
        const iframeUrl = `${IFRAMELY_API_ENDPOINT}?app=1&api_key=${iframelyApiKey}&url=${encodeURIComponent(
          path
        )}`
        return iframelyEmbedTemplate(iframeUrl)
      }
    },
    {
      name: 'youtube',
      url: [
        /^https?:\/\/(?:www\.)?youtube\.com\/(?:tv#\/)?watch\/?\?(?:[^&]+&)*v=([a-zA-Z0-9_-]+)/i,
        /^https?:\/\/youtu.be\/([a-zA-Z0-9_-]+)/i,
        /^https?:\/\/m\.youtube\.com\/#\/watch\?(?:[^&]+&)*v=([a-zA-Z0-9_-]+)/i,
        /^https?:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]+)/i,
        /^https?:\/\/www\.youtube\.com\/v\/([a-zA-Z0-9_-]+)/i,
        /^https?:\/\/www\.youtube\.com\/user\/[a-zA-Z0-9_-]+\/?\?v=([a-zA-Z0-9_-]+)/i,
        /^https?:\/\/www\.youtube-nocookie\.com\/(?:v|embed)\/([a-zA-Z0-9_-]+)/i
      ],
      html: (match) => {
        const id = match[1]
        return `<div class="iframe-youtube">
                  <iframe src="https://www.youtube.com/embed/${id}" class="youtube-content-area"
                  frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
                  </iframe>
                </div>`
      }
    },
    {
      name: 'gist',
      url: /^gist\.github\.com/,
      html: (match) => {
        const path = 'https://' + match['input']
        const iframeUrl = `${IFRAMELY_API_ENDPOINT}?app=1&api_key=${iframelyApiKey}&url=${encodeURIComponent(
          path
        )}`
        return iframelyEmbedTemplate(iframeUrl)
      }
    },
    {
      name: 'instagram',
      url: [
        /^https?:\/\/(?:www.)?instagram\.com\/(?:[a-zA-Z0-9_-]+\/)?(?:p|tv)\/([a-zA-Z0-9_-]+)\/?/i,
        /^https?:\/\/instagr\.am\/(?:[a-zA-Z0-9_-]+\/)?p\/([a-zA-Z0-9_-]+)/i,
        /^https?:\/\/instagram\.com\/(?:[a-zA-Z0-9_-]+\/)?(?:p|tv)\/([a-zA-Z0-9_-]+)$/i
      ],
      html: (match) => {
        const path = match['input']
        const iframeUrl = `${IFRAMELY_API_ENDPOINT}?app=1&api_key=${iframelyApiKey}&url=${encodeURIComponent(
          path
        )}`
        return iframelyEmbedTemplate(iframeUrl)
      }
    },
    {
      name: 'any',
      url: VALIDATE_URL_REGEXP,
      html: (match) => {
        const path = match[0]
        return `<div class="iframe-any">
                 <iframe src="https://${domain}/media_embed/any?url=${encodeURIComponent(path)}"
                 frameborder="0" allow="autoplay; encrypted-media" allowfullscreen class="any-content-area">
                 </iframe>
               </div>`
      }
    }
  ]
}

function iframelyEmbedTemplate(url) {
  return `<div class="iframely-embed">
            <div class="iframely-responsive">
              <iframe src="${url}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
              </iframe>
            </div>
          </div>`
}
