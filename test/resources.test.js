import test from 'node:test';
import assert from 'node:assert/strict';
import {resourcesFor} from '../shared/resources.js';

const schemes = overrides => resourcesFor({tool: 'schemes', land: 2, ...overrides});

test('location selects a local scheme and the inclusive land boundary selects pension guidance', () => {
  assert.equal(schemes({state: ' Telangana '})[0].title, 'Rythu Bharosa');
  assert.equal(schemes({state: 'ఆంధ్రప్రదేశ్'})[0].title, 'Annadata Sukhibhava');
  assert.ok(schemes({}).some(link => link.title === 'PM Kisan Maan-Dhan'));
  assert.ok(!schemes({land: 2.01}).some(link => link.title === 'PM Kisan Maan-Dhan'));
  assert.equal(schemes({state: 'Goa', land: ''}).length, 1);
});

test('a supplied social category prioritizes private government discovery', () => {
  const [link] = schemes({state: 'Bihar', category: 'SC'});
  assert.equal(link.url, 'https://www.myscheme.gov.in/');
  assert.match(link.reason, /household category/);
});

test('learning searches stay on the council channel and encode special characters', () => {
  const [video] = resourcesFor({tool: 'learn', crop: 'धान', topic: 'water & soil#1', lang: 'hi'});
  const channel = new URL(video.url);
  assert.equal(channel.pathname, '/c/IndianCouncilofAgriculturalResearchOfficial/search');
  assert.equal(channel.searchParams.get('query'), 'धान water & soil#1');
  assert.equal(channel.hostname, 'www.youtube.com');
  assert.match(video.reason, /फसल/);
});

test('each tool provides secure resources with localized explanations and an English fallback', () => {
  for (const tool of ['crop', 'harvest', 'soil', 'schemes', 'learn']) {
    const resources = resourcesFor({tool, lang: 'te'});
    assert.ok(resources.length > 0);
    for (const resource of resources) {
      assert.match(resource.url, /^https:\/\//);
      assert.match(resource.reason, /[\u0c00-\u0c7f]/);
    }
    assert.deepEqual(resourcesFor({tool, lang: 'fr'}), resourcesFor({tool, lang: 'en'}));
  }
  assert.deepEqual(resourcesFor({tool: 'unknown'}), []);
});
