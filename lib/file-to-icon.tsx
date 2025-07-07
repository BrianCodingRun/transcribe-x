import React, { lazy, Suspense } from 'react';

const VideoIcon = lazy(() => import('react-icons/bs').then(module => ({ default: module.BsFillCameraVideoFill })));
const AudioIcon = lazy(() => import('react-icons/pi').then(module => ({ default: module.PiSpeakerSimpleHighFill })));
const TextIcon = lazy(() => import('react-icons/bs').then(module => ({ default: module.BsFileEarmarkTextFill })));
const ImageIcon = lazy(() => import('react-icons/bs').then(module => ({ default: module.BsFillImageFill })));
const DefaultIcon = lazy(() => import('react-icons/ai').then(module => ({ default: module.AiFillFile })));

export default function fileToIcon(file_type: string) {
  if (file_type.includes('video')) return <Suspense fallback={null}><VideoIcon /></Suspense>;
  if (file_type.includes('audio')) return <Suspense fallback={null}><AudioIcon /></Suspense>;
  if (file_type.includes('text')) return <Suspense fallback={null}><TextIcon /></Suspense>;
  if (file_type.includes('image')) return <Suspense fallback={null}><ImageIcon /></Suspense>;
  return <Suspense fallback={null}><DefaultIcon /></Suspense>;
}