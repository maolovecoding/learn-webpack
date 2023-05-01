import React from 'react'
import Sliders from './Sliders'
// import List from 'remote/List' // 使用远程组件
// 使用远程组件 必须使用lazy进行加载 且使用组件时外层包裹suspence
const RemoteList = React.lazy(() => import("remote/List"))
function App(){
  return (
    <div>
      <h2>remote组件List</h2>
      <React.Suspense fallback="loading remote list">
      <RemoteList/>
      </React.Suspense>
      <h2>本地组件Sliders</h2>
      <Sliders/>
    </div>   
  )
}

export default App 
