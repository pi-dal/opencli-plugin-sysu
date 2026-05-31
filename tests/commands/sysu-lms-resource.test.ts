import { beforeEach, describe, expect, it, vi } from 'vitest'

const cliMock = vi.fn()

vi.mock('@jackwener/opencli/registry', () => ({
  Strategy: {
    COOKIE: 'cookie'
  },
  cli: cliMock
}))

describe('sysu-lms resource', () => {
  beforeEach(() => {
    cliMock.mockReset()
    vi.resetModules()
  })

  it('registers the sysu lms-resource command with cookie strategy', async () => {
    await import('../../sysu-lms-resource.ts')

    expect(cliMock).toHaveBeenCalledTimes(1)

    const config = cliMock.mock.calls[0][0]

    expect(config.site).toBe('sysu')
    expect(config.name).toBe('lms-resource')
    expect(config.domain).toBe('lms.sysu.edu.cn')
    expect(config.strategy).toBe('cookie')
    expect(config.browser).toBe(true)
    expect(config.args).toEqual([
      expect.objectContaining({ name: 'url-or-id', positional: true, required: true })
    ])
  })

  it('returns resource info with name, type and url', async () => {
    await import('../../sysu-lms-resource.ts')

    const config = cliMock.mock.calls[0][0]
    const page = {
      goto: vi.fn(),
      evaluate: vi.fn()
    }
    page.evaluate
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce({
        name: 'Lecture Notes',
        type: 'file',
        url: 'https://lms.sysu.edu.cn/mod/fsresource/view.php?id=42',
        downloadUrl: 'https://lms.sysu.edu.cn/pluginfile.php/1/mod_resource/content/1/notes.pdf',
        mimetype: 'application/pdf'
      })

    const result = await config.func(page, { urlOrId: '42' })

    expect(result.name).toBe('Lecture Notes')
    expect(result.type).toBe('file')
    expect(result.downloadUrl).toContain('pluginfile.php')
    expect(page.goto).toHaveBeenCalledWith(expect.stringContaining('/mod/fsresource/'))
  })

  it('handles video resources with playback info', async () => {
    await import('../../sysu-lms-resource.ts')

    const config = cliMock.mock.calls[0][0]
    const page = {
      goto: vi.fn(),
      evaluate: vi.fn()
    }
    page.evaluate
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce({
        name: 'Lecture Video',
        type: 'video',
        url: 'https://lms.sysu.edu.cn/mod/fsresource/view.php?id=99',
        playback: { hasPlayer: true, hasRateControl: true }
      })

    const result = await config.func(page, { urlOrId: '99' })

    expect(result.name).toBe('Lecture Video')
    expect(result.type).toBe('video')
    expect(result.playback?.hasPlayer).toBe(true)
    expect(result.playback?.hasRateControl).toBe(true)
  })
})
