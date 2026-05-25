import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the developer blog header', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Developer Blog')
  })

  it('shows the empty viewer message when no post is selected', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Select a blog post to view details')
  })
})
