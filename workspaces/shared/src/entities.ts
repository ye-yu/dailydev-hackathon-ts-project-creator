export type * from '@ye-yu/database'

import type * as database from '@ye-yu/database'

export type BlogFileLazy = Omit<database.BlogFile, 'post'> & { post?: BlogPostLazy }
export type BlogPostLazy = Omit<database.BlogPost, 'files'> & { files?: BlogFileLazy[] }
