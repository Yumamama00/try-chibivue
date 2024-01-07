export interface RendererNode {
  [key: string]: any
}

export interface RendererOptions<HostNode = RendererNode> {
  setElementText(node: HostNode, text: string): void
}

export interface RendererElement extends RendererNode {}

export type RootRenderFunction<HostElement = RendererElement> = (
  container: HostElement,
  message: string,
) => void

export function createRenderer(options: RendererOptions) {
  const { setElementText: hostSetElementText } = options

  const render: RootRenderFunction = (container, message) => {
    hostSetElementText(container, message)
  }

  return { render }
}
