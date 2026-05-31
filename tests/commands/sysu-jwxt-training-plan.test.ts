import { beforeEach, describe, expect, it, vi } from 'vitest'

const cliMock = vi.fn()

vi.mock('@jackwener/opencli/registry', () => ({
  Strategy: {
    COOKIE: 'cookie'
  },
  cli: cliMock
}))

describe('sysu jwxt-training-plan', () => {
  beforeEach(() => {
    cliMock.mockReset()
    vi.resetModules()
  })

  it('registers the sysu jwxt-training-plan command with filter args', async () => {
    await import('../../sysu-jwxt-training-plan.ts')

    expect(cliMock).toHaveBeenCalledTimes(1)

    const config = cliMock.mock.calls[0][0]

    expect(config.site).toBe('sysu')
    expect(config.name).toBe('jwxt-training-plan')
    expect(config.domain).toBe('jwxt.sysu.edu.cn')
    expect(config.strategy).toBe('cookie')
    expect(config.browser).toBe(true)
    expect(config.args).toEqual([
      expect.objectContaining({ name: 'year' }),
      expect.objectContaining({ name: 'college' }),
      expect.objectContaining({ name: 'major' }),
      expect.objectContaining({ name: 'type' })
    ])
  })

  it('builds a script that collects the full dataset from the profession-info API', async () => {
    await import('../../sysu-jwxt-training-plan.ts')

    const config = cliMock.mock.calls[0][0]
    const page = {
      evaluate: vi.fn(async () => ({
        headers: ['序号', '年级', '学院', '专业方向代码', '专业方向名称', '培养类别'],
        rows: [['1', '2021', '中山大学', 'n10020004', '新医科实验班', '主修']],
        total: 1,
        collected: 3604
      }))
    }

    const result = await config.func(page, {})

    expect(page.evaluate).toHaveBeenCalledTimes(1)
    const script = (page.evaluate as any).mock.calls[0][0]

    expect(script).toContain('/training-programe/training-programe/undergradute/profession-info')
    expect(script).toContain('pageNo')
    expect(script).toContain('pageSize')
    expect(script).toContain('total: true')
    expect(script).toContain('while (collected.length < totalDeclared')
    expect(script).toContain('maxPages')
    expect(script).toContain('fetch(')
    expect(result.length).toBe(1)
  })

  it('filters --type with exact match (not includes)', async () => {
    await import('../../sysu-jwxt-training-plan.ts')

    const config = cliMock.mock.calls[0][0]
    const page = {
      evaluate: vi.fn(async () => ({
        headers: ['序号', '年级', '学院', '专业方向代码', '专业方向名称', '培养类别'],
        rows: [
          ['1', '2021', '中山大学', 'n10020004', '新医科实验班', '主修'],
          ['2', '2021', '中大', 'n08260003', '生医工实验班', '辅修'],
          ['3', '2021', '中大', 'n08090004', '智能实验班', '主修,辅修'],
          ['4', '2021', '中大', 'n07070003', '大海洋实验班', '辅修微专业']
        ],
        total: 4,
        collected: 4
      }))
    }

    // --type '辅修' should match ONLY exact '辅修', not '主修,辅修' or '辅修微专业'
    const result = await config.func(page, { type: '辅修' })

    expect(result).toEqual([
      ['2', '2021', '中大', 'n08260003', '生医工实验班', '辅修']
    ])
    expect(result.length).toBe(1)
  })

  it('filters returned rows against the declared training-plan columns', async () => {
    await import('../../sysu-jwxt-training-plan.ts')

    const config = cliMock.mock.calls[0][0]
    const page = {
      evaluate: vi.fn(async () => ({
        headers: ['序号', '年级', '学院', '专业方向代码', '专业方向名称', '培养类别'],
        rows: [
          ['1', '2021', '生物医学工程学院', 'n08260003', '生医工实验班', '主修'],
          ['2', '2021', '中山大学', 'n10020004', '新医科实验班', '主修'],
          ['3', '2020', '电子与信息工程学院', 'n08090004', '智能实验班', '辅修']
        ],
        total: 3,
        collected: 3604
      }))
    }

    const result = await config.func(page, {
      college: '生物医学',
      year: '2021',
      major: '生医工',
      type: '主修'
    })

    expect(result).toEqual([
      ['1', '2021', '生物医学工程学院', 'n08260003', '生医工实验班', '主修']
    ])
    expect(result.length).toBe(1)
  })
})
