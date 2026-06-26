/*
 * Copyright 2026 Stephan Schultchen
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
import fs from 'fs';
import path from 'path';

const componentsDir = path.join(
  process.cwd(),
  'src/components'
);
const viewsDir = path.join(
  process.cwd(),
  'src/views'
);

const generateTestContent = ({
  componentName,
}) => {
  return `import { describe } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { primeVueStubs } from '@/__test_utils__/helpers'
import { createMockResourceDef } from '@/__test_utils__/helpers'
import ${componentName} from '../${componentName}.vue'

vi.mock('@/api/client', () => {
  return {
    default: {
      get: () => {
        return Promise.resolve({
          result: [],
          meta: {},
          nodes: [],
          filters: []
        })
      },
      request: () => {
        return Promise.resolve({})
      },
      delete: () => {
        return Promise.resolve({})
      },
      post: () => {
        return Promise.resolve({})
      },
      put: () => {
        return Promise.resolve({})
      }
    }
  }
})

vi.mock('@/stores/auth', () => {
  return {
    authStore: () => {
      return {
        getUserDataIsAdmin: true,
        isLoaded: false,
        hasPermission: () => {
          return true
        },
        hasPermissionPattern: () => {
          return true
        },
        getPermissionMatches: () => {
          return []
        },
        resetTimestamp: vi.fn(),
        resetUserData: vi.fn(),
        resetIsLoaded: vi.fn(),
        reset: vi.fn(),
        fetchUserData: vi.fn(),
        setUserData: vi.fn()
      }
    }
  }
})

vi.mock('@/stores/apiError', () => {
  return {
    apiErrorStore: () => {
      return {
        setRedirect: vi.fn()
      }
    }
  }
})

describe('${componentName}', () => {
  it('mounts successfully', () => {
    const wrapper = mount(
      ${componentName},
      {
        props: {
          resourceDef: createMockResourceDef(),
          status: 'active',
          modelValue: ''
        },
        global: {
          stubs: primeVueStubs
        }
      }
    )
    expect(
      wrapper.exists()
    ).toBe(true)
  })
})
`
}

const processDir = ({
  dir,
}) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(
      dir,
      file
    );
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== '__tests__' && file !== 'node_modules') {
        processDir({
          dir: fullPath,
        });
      }
    } else if (file.endsWith('.vue')) {
      const componentName = file.replace(
        '.vue',
        ''
      );
      const testsDir = path.join(
        dir,
        '__tests__'
      );
      if (!fs.existsSync(testsDir)) {
        fs.mkdirSync(testsDir);
      }
      const testFilePath = path.join(
        testsDir,
        `${componentName}.spec.js`
      );
      fs.writeFileSync(
        testFilePath,
        generateTestContent({
          componentName,
        })
      );
      console.log(`Created/updated test for ${componentName}`);
    }
  });
};

processDir({
  dir: componentsDir,
});
processDir({
  dir: viewsDir,
});
console.log('Test generation complete.');
