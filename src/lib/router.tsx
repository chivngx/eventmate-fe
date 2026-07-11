"use client"

/**
 * Compat layer: mimics the subset of `react-router-dom` API used by this app,
 * backed by Next.js App Router (`next/navigation` + `next/link`).
 *
 * This lets the migrated components keep their original call sites, e.g.:
 *   const navigate = useNavigate()
 *   const [searchParams, setSearchParams] = useSearchParams()
 *   const { id } = useParams()
 *   <Link to="/x">...</Link>
 *   <Navigate to="/login" />
 *
 * Semantics closely follow react-router v7:
 *  - useNavigate() returns a function: navigate(to) | navigate(to, {replace}) | navigate(-1)
 *  - useSearchParams() returns [URLSearchParams (mutable copy), setSearchParams].
 *    setSearchParams REPLACEs the whole query string with the provided value
 *    (object / string / URLSearchParams), or accepts an updater fn(prev) => next.
 *  - useLocation() returns { pathname, search }.
 *  - useParams() returns the dynamic route params.
 */

import { useCallback, useEffect, useMemo } from "react"
import {
  useRouter,
  usePathname,
  useSearchParams as useNextSearchParams,
  useParams as useNextParams,
} from "next/navigation"
import NextLink from "next/link"

type NavigateOptions = { replace?: boolean }

export function useNavigate() {
  const router = useRouter()
  return useCallback(
    (to: string | number, opts?: NavigateOptions) => {
      if (typeof to === "number") {
        if (to < 0) router.back()
        else router.forward()
        return
      }
      if (opts?.replace) router.replace(to)
      else router.push(to)
    },
    [router]
  )
}

type SearchParamsInit =
  | string
  | URLSearchParams
  | Record<string, string | null | undefined>
  | ((
      prev: URLSearchParams
    ) => string | URLSearchParams | Record<string, string | null | undefined>)

export function useSearchParams() {
  const router = useRouter()
  const pathname = usePathname()
  const nextSearchParams = useNextSearchParams()

  const searchParams = useMemo(
    () => new URLSearchParams(nextSearchParams.toString()),
    [nextSearchParams]
  )

  const setSearchParams = useCallback(
    (nextInit: SearchParamsInit) => {
      const current = new URLSearchParams(nextSearchParams.toString())
      const resolved =
        typeof nextInit === "function" ? nextInit(current) : nextInit

      let params: URLSearchParams
      if (resolved instanceof URLSearchParams) {
        params = new URLSearchParams(resolved.toString())
      } else if (typeof resolved === "string") {
        params = new URLSearchParams(resolved)
      } else if (resolved && typeof resolved === "object") {
        // REPLACE semantics (matches react-router): build a fresh query string
        params = new URLSearchParams()
        Object.entries(resolved).forEach(([k, v]) => {
          if (v !== null && v !== undefined) params.set(k, String(v))
        })
      } else {
        params = current
      }

      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [nextSearchParams, router, pathname]
  )

  return [searchParams, setSearchParams] as const
}

export function useLocation() {
  const pathname = usePathname()
  const search =
    typeof window !== "undefined" ? window.location.search : ""
  return { pathname, search }
}

export function useParams<T = Record<string, string | string[]>>() {
  return useNextParams() as T
}

/**
 * Link compat: accepts react-router's `to` prop (falls back to `href`).
 */
type LinkProps = Omit<React.ComponentProps<typeof NextLink>, "href"> & {
  to?: string
  href?: string
  children?: React.ReactNode
}

export function Link({ to, href, children, ...rest }: LinkProps) {
  const destination = href ?? to ?? "#"
  return (
    <NextLink href={destination} {...rest}>
      {children}
    </NextLink>
  )
}

/**
 * Navigate compat: imperatively redirects on mount (client-side).
 */
export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const router = useRouter()
  useEffect(() => {
    if (replace) router.replace(to)
    else router.push(to)
  }, [to, replace, router])
  return null
}
