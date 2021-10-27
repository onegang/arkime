/******************************************************************************/
/* Copyright Yahoo Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this Software except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Integration = require('../integration.js');
const axios = require('axios');

class URLScanIntegration extends Integration {
  name = 'URLScan';
  itypes = {
    url: 'fetchUrl'
  };

  key;

  constructor () {
    super();

    Integration.register(this);
  }

  async fetchUrl (user, url) {
    try {
      const key = this.getUserConfig(user, 'URLScanKey');
      if (!key) {
        return undefined;
      }

      const urlScanRes = await axios.get('https://urlscan.io/api/v1/search/', {
        params: {
          q: url
        },
        headers: {
          'API-Key': key,
          'User-Agent': this.userAgent()
        }
      });
      return urlScanRes.data;
    } catch (err) {
      console.log('URLSCAN', url, err);
      return null;
    }
  }
}

// eslint-disable-next-line no-new
new URLScanIntegration();
