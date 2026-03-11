// Mock des APIs Electron pour le navigateur
window.novelist = {
  projects: {
    create: async (name) => {
      console.log('Mock: Creating project', name);
      return { path: '/mock/project', name };
    },
    list: async () => [],
    openDialog: async () => null,
    load: async (path) => ({ path, name: 'Mock Project' })
  },
  chapters: {
    list: async (path) => [],
    create: async (path, name) => ({ id: 'mock-chapter', name }),
    save: async (path, id, data) => console.log('Mock: Saving chapter', id, data),
    createScene: async (path, chapterId, name) => ({ id: 'mock-scene', name }),
    saveScene: async (path, chapterId, id, data) => console.log('Mock: Saving scene', id, data),
    delete: async (path, id) => console.log('Mock: Deleting chapter', id),
    deleteScene: async (path, chapterId, id) => console.log('Mock: Deleting scene', id),
    reorder: async (path, chapters) => console.log('Mock: Reordering chapters', chapters)
  },
  characters: {
    list: async (path) => [],
    save: async (path, id, data) => console.log('Mock: Saving character', id, data),
    delete: async (path, id) => console.log('Mock: Deleting character', id)
  },
  notes: {
    list: async (path) => [],
    save: async (path, id, data) => console.log('Mock: Saving note', id, data),
    delete: async (path, id) => console.log('Mock: Deleting note', id)
  },
  git: {
    init: async (path) => console.log('Mock: Git init', path),
    commit: async (path, message) => console.log('Mock: Git commit', message),
    push: async (path) => console.log('Mock: Git push', path),
    pull: async (path) => console.log('Mock: Git pull', path),
    setRemote: async (path, url) => console.log('Mock: Set remote', url)
  },
  exports: {
    project: async (path) => console.log('Mock: Export project', path)
  },
  preferences: {
    get: async () => ({}),
    set: async (values) => console.log('Mock: Setting preferences', values)
  },
  shell: {
    openExternal: (url) => window.open(url, '_blank')
  }
};

// Mock marked pour le markdown
window.marked = {
  parse: (text) => `<p>${text}</p>`
};

// Mock appMenu
window.appMenu = {
  on: (event, callback) => console.log('Mock: Menu event', event)
};

console.log('🌐 Browser mode loaded - Electron APIs mocked');
