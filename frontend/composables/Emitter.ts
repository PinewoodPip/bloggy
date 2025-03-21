import mitt from 'mitt'

const emitter = mitt()

export const useGlobalEvents = () => {
  return emitter
}