import { rest } from 'msw'

export const handlers = [
  rest.post('/entry', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
          message: 'entry created',
      })
    )
  }),

  rest.get('/entry', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([{
        note: "foobar",
        amount: 10.00,
        type: 1,
        timestamp: "Tue Jan 05 2021 14:36:56 GMT+0530 (India Standard Time)"
      }])
    )
  })
]
