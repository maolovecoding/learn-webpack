import React from 'react'
import List from './List'
// const RemoteSliders = React.lazy(() => import('remote/Sliders'))
function App(){
  return (
    <div>
      <h2>本地组件list</h2>
      <List/>
      {/* <h2>remote组件Sliders</h2>
      <React.Suspense fallback="remote sliders">
        <RemoteSliders/>
      </React.Suspense> */}
    </div>   
  )
}

export default App 
