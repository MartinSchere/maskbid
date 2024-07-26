import { int, pfn, phoist, PValue } from "@harmoniclabs/plu-ts";

export const plovelaces = phoist(
    pfn([ PValue.type ], int )
    ( value => value.head.snd.head.snd )
)