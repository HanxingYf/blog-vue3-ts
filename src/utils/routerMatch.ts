// 路由精确匹配

export function RouterMatch(url: string, path: string): boolean {
    const routes = url.split('/');
    return routes.includes(path);
}

// export const RouterMatch = (url: string) => {
//     const path: string = this.$route.path
// }
