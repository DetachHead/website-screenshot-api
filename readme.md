# website-screenshot-api

an api to take screenshots of sites or HTML

## setup

```
docker-compose up
```

## usage

### query parameters

| name             | type                              | description                                                                                                                                                                                                                                                                                                                                      | default                    |
| :--------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| `input`          | `string`                          | either a URL to navigate to or HTML to be rendered                                                                                                                                                                                                                                                                                               | (required)                 |
| `screenshotMode` | `'normal' \| 'full' \| 'element'` | - `normal`: takes a screenshot of the contents visible in the viewport (default if `input` is a url)<br/>- `full`: includes the entire page in the screenshot<br/>- `element`: mainly for when the input is html, only includes the html content and no empty space. probably won't work properly for most websites (default if `input` is html) | (depends, see description) |
| `blockAds`       | `boolean`                         | whether to block ads using [`@cliqz/adblocker-playwright`](https://www.npmjs.com/package/@cliqz/adblocker-playwright)                                                                                                                                                                                                                            | `true`                     |
