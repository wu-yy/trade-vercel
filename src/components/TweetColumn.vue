<template>
    <div class="tweet-column">
      <div class="column-title"><h2>{{ title }}</h2></div>
      <div v-if="tweets.length === 0" style="padding: 20px 0 0 20px;">No tweets available.</div>
      <div v-for="tweet in tweets" :key="tweet.url" class="tweet-card">
        <div class="tweet-header">
          <div class="tweet-header-info">
            <span class="tweet-username">
              {{ tweet.account }}
            </span>
          </div>
        </div>
        <p class="tweet-content">
            <a :href="tweet.url" target="_blank" class="tweet-link">
                <span v-html="highlightCrypto(tweet.text)" class="highlighted-text"></span>
            </a>
        </p>
        <p class="tweet-time"><strong>Time:</strong> {{ formatTime(tweet.time) }}</p>
        <div v-if="getCryptoMentions(tweet.text).length > 0" class="crypto-alert">
            This tweet mentions cryptocurrencies: {{ getCryptoMentions(tweet.text).join(', ') }}
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      title: String,
      tweets: Array,
    },
    methods: {
      formatTime(time) {
        return new Date(time).toLocaleString();
      },
      highlightCrypto(text) {
        const cryptoRegex = /\$[A-Za-z]+/g;
        return text.replace(cryptoRegex, match => `<span class="crypto-tag">${match}</span>`);
     },
      getCryptoMentions(text) {
        const cryptoRegex = /\$[A-Za-z]+/g;
        return text.match(cryptoRegex) || [];
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add column-specific styles here */

        /* .tweet-column {
            flex: 1;
            min-width: 0;
            background-color: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow-y: auto;
            max-height: calc(100vh - 40px);
        } */

        .column-title {
            /* all: unset; 移除所有默认样式 */
            border: none;
            box-shadow: none;
            padding: 20px 0 0 20px;
            box-shadow: none;
            border: none;
            margin-bottom: 20px;
        }
        h2, h3 {
            /* color: var(--text-color); */
            /* border-bottom: 1px solid var(--border-color); */
            font-size: 1.2rem;
            font-weight: bold;
            color: blue;
            box-shadow: none;
            border: none;
        }

        .account-item, .tweet-card {
            background-color: var(--card-background);
            /* border-radius: 10px; */
            padding: 15px;
            /* margin-bottom: 15px; */
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            /* border: 1px solid var(--border-color); */
            border-top: 1px solid var(--border-color);
            word-wrap: break-word;
            overflow-wrap: break-word;
            backdrop-filter: blur(5px);
            /* background-color: black; */
        }

        .account-item:hover, .tweet-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(255, 255, 255, 0.1);
        }


        .tweet-card.new-tweet {
            background-color: var(--new-tweet-color);
            animation: fadeBackground 5s forwards;
        }

        @keyframes fadeBackground {
            from { background-color: var(--new-tweet-color); }
            to { background-color: var(--card-background); }
        }

        .tweet-link {
            color: var(--accent-color);
            text-decoration: none;
        }

        .tweet-link:hover {
            text-decoration: underline;
        }

        .crypto-tag {
            background-color: var(--crypto-highlight);
            color: var(--background-color);
            font-weight: bold;
            padding: 2px 6px;
            border-radius: 12px;
            margin-right: 5px;
        }

        .crypto-alert {
            background-color: rgba(255, 215, 0, 0.2);
            border: 1px solid var(--crypto-highlight);
            padding: 10px;
            margin-top: 10px;
            border-radius: 5px;
        }


        @media (max-width: 1200px) {
            .right-panel {
                flex-direction: column;
            }
        }

        .tweet-column::-webkit-scrollbar {
            width: 8px;
        }

        
        .tweet-column::-webkit-scrollbar-track {
            background: rgb(255, 255, 255);
            border-radius: 4px;
        }

        .tweet-column::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.3);
            border-radius: 4px;
        }

        /* .tweet-column::-webkit-scrollbar-thumb:hover {
            background-color: rgba(255, 255, 255, 0.5);
        } */
  </style>
  