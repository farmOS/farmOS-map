This directory contains methods of the farmOS map instance object. This is done
to simplify `instance.js` and isolate method code and dependencies into separate
includes. Therefore, functions that are exported from these files may contain
assumptions that they are part of the instance object (eg: they may refer to
instance properties like `this.map`). Do not use them in other contexts.
