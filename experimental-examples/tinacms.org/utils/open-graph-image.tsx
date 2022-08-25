export function openGraphImage(
  title: string,
  altSuffix: string = '',
  subtitle?: string
) {
  let url
  //cloudinary can't handle url encoded slashes
  const encodedTitle = encodeURIComponent(title.replace('/', ' '))
  const encodedSubtitle = subtitle && encodeURIComponent(subtitle)
  const renderSubtitle = typeof encodedSubtitle === 'string'

  if (renderSubtitle) {
    url = `https://res.cloudinary.com/forestry-demo/image/upload/l_text:tuner-regular.ttf_70:${encodedTitle},g_north_west,x_270,y_95,w_840,c_fit,co_rgb:EC4815/l_text:tuner-regular.ttf_35:${encodedSubtitle},g_north_west,x_270,y_500,w_840,c_fit,co_rgb:241748/v1581087220/TinaCMS/tinacms-social-empty.png`
  } else {
    url = `https://res.cloudinary.com/forestry-demo/image/upload/l_text:tuner-regular.ttf_90_center:${encodedTitle},g_center,x_0,y_50,w_850,c_fit,co_rgb:EC4815/v1581087220/TinaCMS/tinacms-social-empty-docs.png`
  }

  return {
    url,
    width: 1200,
    height: 628,
    alt: title + altSuffix,
  }
}
