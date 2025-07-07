'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { MdClose, MdDone, MdOutlineErrorOutline } from "react-icons/md";
import { ImSpinner3 } from "react-icons/im";
import { HiOutlineDownload } from "react-icons/hi";
import { BiError } from "react-icons/bi";
import ReactDropzone from "react-dropzone";
import bytesToSize from "@/lib/bytes-to-sizes";
import fileToIcon from "@/lib/file-to-icon";
import compressFileName from "@/lib/compress-file-name";
import convertFile from "@/lib/convert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import loadFfmpeg from "@/lib/load-ffmpeg";
import { useToast } from "@/components/ui/use-toast";
import type { Action } from "@/types";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { RiFolderMusicLine, RiFolderImageLine, RiFileTextLine } from "react-icons/ri";
import { ToastAction } from "@radix-ui/react-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import JSZip from "jszip";
import next from "next";

const extensions = {
  image: ["jpg", "jpeg", "png", "gif", "bmp", "webp", "ico", "tif", "tiff", "tga"],
  audio: ["mp3", "wav", "ogg", "aac", "wma", "flac", "m4a"],
  doc: ["pdf", "word", "txt", "docx", "xlsx", "pptx"],
};

export default function Dropzone() {
  const { toast } = useToast();
  const [isHover, setIsHover] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [emptySelection, setEmptySelection] = useState(false);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [defaultValues, setDefaultValues] = useState<"audio" | "image" | "doc">("audio");

  const acceptedFiles = useMemo(() => ({
    "image/*": extensions.image.map(ext => `.${ext}`),
    "audio/*": extensions.audio.map(ext => `.${ext}`),
    "application/*": extensions.doc.map(ext => `.${ext}`), // Pour les documents
  }), []);

  const load = useCallback(async () => {
    const ffmpegResponse: FFmpeg = await loadFfmpeg();
    ffmpegRef.current = ffmpegResponse;
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = useCallback((data: Array<any>): void => {
    setIsHover(false);

    const newActions = data.map(file => ({
      file_name: file.name,
      file_size: file.size,
      from: file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2),
      to: null,
      file_type: file.type,
      file,
      is_converted: false,
      is_converting: false,
      is_error: false,
    }));

    setActions(prevActions => [...prevActions, ...newActions]);
    setFiles(prevFiles => [...prevFiles, ...data]);

  }, []);

  const updateAction = useCallback((file_name: string, to: string) => {
    setActions(actions.map(action => (
      action.file_name === file_name ? { ...action, to } : action
    )));
    setEmptySelection(false);
  }, [actions]);

  const convert = useCallback(async (): Promise<any> => {
    if (actions.filter(action => action.to).length === 0) {
      setEmptySelection(true);
      return;
    }

    let updatedActions = actions.map((action) => ({
      ...action,
      is_converting: true,
      is_error: false,
    }))
    setActions(updatedActions);
    setIsConverting(true);
    for (let action of actions) {
      try {
        if (!ffmpegRef.current) throw new Error("FFmpeg instance is not available");
        const { url, output } = await convertFile(ffmpegRef.current, action);
        updatedActions = updatedActions.map((updatedAction) => (updatedAction.file_name === action.file_name ? { ...updatedAction, is_converted: true, is_converting: false, url, output } : updatedAction));
        setActions(updatedActions);
      } catch (error) {
        updatedActions = updatedActions.map((updatedAction) => (updatedAction.file_name === action.file_name ? { ...updatedAction, is_converted: false, is_converting: false, is_error: true } : updatedAction));
        setActions(updatedActions);
      }
    }
    setIsDone(true);
    setIsConverting(false);
  }, [actions]);

  const download = useCallback((action: Action) => {
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = action.url;
    a.download = action.output;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(action.url);
    document.body.removeChild(a);
  }, []);

  const downloadAll = useCallback(async () => {
    if (actions.filter(action => action.is_converted).length > 1) {
      const zip = new JSZip();
      actions.forEach(action => {
        if (action.is_converted && !action.is_error) {
          const fileName = action.output || action.file_name;
          zip.file(fileName, fetch(action.url).then(res => res.blob()));
        }
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = URL.createObjectURL(content);
      a.download = 'converted_files.zip';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(a.href);
      document.body.removeChild(a);
    } else if (actions.length === 1) {
      download(actions[0]);
    }
  }, [actions, download]);

  const deleteAction = useCallback((action: Action) => {
    setActions(prevActions => prevActions.filter(elt => elt !== action));
    setFiles(prevFiles => prevFiles.filter(elt => elt.name !== action.file_name));
  }, []);

  const handleHover = () => setIsHover(true);
  const handleExitHover = () => setIsHover(false);

  return (
    <>
      <Tabs defaultValue={defaultValues}>
        <TabsList className="h-8 md:h-10">
          <TabsTrigger className="py-1 md:py-1.5 text-xs md:text-sm" value="audio" onClick={() => setDefaultValues("audio")}>
            Audios
          </TabsTrigger>
          <TabsTrigger className="py-1 md:py-1.5 text-xs md:text-sm" value="image" onClick={() => setDefaultValues("image")}>
            Images
          </TabsTrigger>
          <TabsTrigger className="py-1 md:py-1.5 text-xs md:text-sm" value="doc" onClick={() => setDefaultValues("doc")}>
            Docs
          </TabsTrigger>
        </TabsList>
        <TabsContent value='audio'>
          <ReactDropzone
            onDrop={handleUpload}
            accept={{ "audio/*": acceptedFiles["audio/*"] }}
            onDragEnter={handleHover}
            onDragLeave={handleExitHover}
            onDropRejected={
              () => {
                handleExitHover();
                toast({
                  variant: "destructive",
                  title: "Erreur lors du téléversement de vos fichiers",
                  description: "Les formats de fichiers autorisés sont: mp3, wav, ogg, aac, wma, flac, m4a",
                  duration: 5000,
                })
              }
            }
            onError={() => {
              handleExitHover();
              toast({
                variant: "destructive",
                title: "Erreur lors du téléversement de vos fichiers",
                description: "Les formats de fichiers autorisés sont: mp3, wav, ogg, aac, wma, flac, m4a",
                duration: 5000,
                action: (
                  <ToastAction
                    altText="Close"
                  >
                    Close
                  </ToastAction>
                ),
              })
            }}
            multiple
          >
            {({ getRootProps, getInputProps }) => (
              <div
                {...getRootProps()}
                className={`h-48 md:h-96 flex justify-center items-center rounded-xl border-dashed border-2 ${isHover
                  ? "border-green-500"
                  : "border-secondary"
                  } bg-background cursor-pointer hover:border-green-500 transition-all`}
              >
                <input {...getInputProps()} />
                <div className="space-y-4 text-center">
                  <RiFolderMusicLine className="text-4xl md:text-7xl mx-auto" />
                  <span className="font-medium text-lg md:text-2xl block text-muted-foreground">
                    Cliquer ou glisser des fichiers ici
                  </span>
                  <span className="font-medium text-xs md:text-md block text-muted-foreground">
                    {`Formats supportés: ${extensions[defaultValues].join(", ")}`}
                  </span>
                </div>
              </div>
            )}
          </ReactDropzone>
        </TabsContent>
        <TabsContent value='image'>
          <ReactDropzone
            onDrop={handleUpload}
            accept={{ "image/*": acceptedFiles["image/*"] }}
            onDragEnter={handleHover}
            onDragLeave={handleExitHover}
            onDropRejected={() => {
              handleExitHover();
              toast({
                variant: "destructive",
                title: "Erreur lors du téléversement de vos fichiers",
                description: "Les formats de fichiers autorisés sont: jpg, jpeg, png, gif, bmp, webp, ico, tif, tiff, svg, raw, tga",
                duration: 5000,
              })
            }}
            onError={() => {
              handleExitHover();
              toast({
                variant: "destructive",
                title: "Erreur lors du téléversement de vos fichiers",
                description: "Les formats de fichiers autorisés sont: jpg, jpeg, png, gif, bmp, webp, ico, tif, tiff, svg, raw, tga",
                duration: 5000,
                action: (
                  <ToastAction
                    altText="Close"
                  >
                    Close
                  </ToastAction>
                ),
              })
            }}
            multiple
          >
            {({ getRootProps, getInputProps }) => (
              <div
                {...getRootProps()}
                className={`h-48 md:h-96 flex justify-center items-center rounded-xl border-dashed border-2 ${isHover
                  ? "border-green-500"
                  : "border-secondary"
                  } bg-background cursor-pointer hover:border-green-500 transition-all`}
              >
                <input {...getInputProps()} />
                <div className="space-y-4 text-center">
                  <RiFolderMusicLine className="text-4xl md:text-7xl mx-auto" />
                  <span className="font-medium text-lg md:text-2xl block text-muted-foreground">
                    Cliquer ou glisser des fichiers ici
                  </span>
                  <span className="font-medium text-xs md:text-md block text-muted-foreground">
                    {`Formats supportés: ${extensions[defaultValues].join(", ")}`}
                  </span>
                </div>
              </div>
            )}
          </ReactDropzone>
        </TabsContent>
        <TabsContent value='doc'>
          <ReactDropzone
            onDrop={handleUpload}
            accept={{ "application/*": acceptedFiles["application/*"] }}
            onDragEnter={handleHover}
            onDragLeave={handleExitHover}
            onDropRejected={() => {
              handleExitHover();
              toast({
                variant: "destructive",
                title: "Erreur lors du téléversement de vos fichiers",
                description: "Les formats de fichiers autorisés sont: pdf, word, txt, docx, xlsx, pptx",
                duration: 5000,
              })
            }}
            onError={() => {
              handleExitHover();
              toast({
                variant: "destructive",
                title: "Erreur lors du téléversement de vos fichiers",
                description: "Les formats de fichiers autorisés sont: pdf, word, txt, docx, xlsx, pptx",
                duration: 5000,
                action: (
                  <ToastAction
                    altText="Close"
                  >
                    Close
                  </ToastAction>
                ),
              })
            }}
            multiple
          >
            {({ getRootProps, getInputProps }) => (
              <div
                {...getRootProps()}
                className={`h-48 md:h-96 flex justify-center items-center rounded-xl border-dashed border-2 ${isHover
                  ? "border-green-500"
                  : "border-secondary"
                  } bg-background cursor-pointer hover:border-green-500 transition-all`}
              >
                <input {...getInputProps()} />
                <div className="space-y-4 text-center">
                  <RiFolderMusicLine className="text-4xl md:text-7xl mx-auto" />
                  <span className="font-medium text-lg md:text-2xl block text-muted-foreground">
                    Cliquer ou glisser des fichiers ici
                  </span>
                  <span className="font-medium text-xs md:text-md block text-muted-foreground">
                    {`Formats supportés: ${extensions[defaultValues].join(", ")}`}
                  </span>
                </div>
              </div>
            )}
          </ReactDropzone>
        </TabsContent>
      </Tabs>
      {
        actions && actions.length > 0 ? (
          <div className="py-4">
            {actions.map((action: Action, i: any) => (

              <div
                key={i}
                className="w-full mb-2 relative rounded-xl border h-20 px-4 lg:px-10 flex flex-wrap lg:flex-nowrap items-center justify-between"
              >
                {!isLoaded && (
                  <Skeleton className="h-full w-full -ml-10 cursor-progress absolute rounded-xl" />
                )}
                <div className="flex gap-4 items-center">
                  {/* Icon */}
                  <span className="text-2xl text-orange-600">
                    {fileToIcon(action.file_type)}
                  </span>
                  {/* File name */}
                  <div className="flex items-center gap-1 w-96">
                    <span className={`w-full text-md font-medium overflow-x-hidden ${action.file_name.length > 10 ? "text-ellipsis" : ""} hover:text-clip hover:cursor-text`}>
                      {compressFileName(action.file_name)}
                    </span>
                    {/* File size */}
                    <span className="w-full text-muted-foreground text-sm">
                      ({bytesToSize(action.file_size)})
                    </span>
                  </div>
                </div>
                {
                  action.is_error ? (
                    <Badge variant="destructive" className="flex gap-2">
                      <span>Une erreur est survenue</span>
                      <BiError />
                    </Badge>
                  ) :
                    action.is_converted ? (
                      <Badge variant="default" className="flex gap-2 bg-green-500">
                        <span>Terminé</span>
                        <MdDone />
                      </Badge>
                    ) :
                      action.is_converting ? (
                        <Badge variant="pending" className="flex gap-2">
                          <span>En cours</span>
                          <span className="animate-spin">
                            <ImSpinner3 />
                          </span>
                        </Badge>
                      ) : (
                        <div className="text-muted-foreground text-md flex items-center gap-4">
                          <span>Convertir en</span>
                          <Select
                            onValueChange={(value) => {
                              updateAction(action.file_name, value);
                            }}
                            value={typeof action.to === "string" ? action.to : undefined} // Utilisez le format spécifique à ce fichier
                          >
                            <SelectTrigger className={`relative w-32 outline-none focus:outline-none focus:ring-0 text-center text-muted-foreground bg-background text-md font-medium lowercase ${emptySelection ? "border-destructive border-2" : ""}`}>
                              {
                                emptySelection && (
                                  <Alert variant="destructive" className="absolute p-0 -top-8 right-0 z-10 w-2/4 py-[0.15rem] pointer-events-none bg-destructive text-destructive-foreground rounded-sm capitalize">
                                    <AlertTitle className="text-xs font-medium">
                                      Requis
                                    </AlertTitle>
                                  </Alert>
                                )
                              }
                              <SelectValue placeholder="..." />
                            </SelectTrigger>
                            <SelectContent className="h-fit">
                              {action.file_type.includes("image") && (
                                <div className="grid grid-cols-2 gap-4">
                                  {extensions.image.filter(format => format !== action.from).map((format) => (
                                    <SelectItem key={format} value={format}>
                                      {format.toUpperCase()}
                                    </SelectItem>
                                  ))}
                                </div>
                              )}
                              {action.file_type.includes("audio") && (
                                <div className="grid grid-cols-2 gap-4">
                                  {extensions.audio.filter(format => format !== action.from).map((format) => (
                                    <SelectItem key={format} value={format}>
                                      {format.toUpperCase()}
                                    </SelectItem>
                                  ))}
                                </div>
                              )}
                              {action.file_type.includes("doc") && (
                                <div className="grid grid-cols-2 gap-4">
                                  {extensions.doc.filter(format => format !== action.from).map((format) => (
                                    <SelectItem key={format} value={format}>
                                      {format.toUpperCase()}
                                    </SelectItem>
                                  ))}
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                <div className="text-md flex items-center gap-4">
                  {action.is_converted && (
                    <HiOutlineDownload
                      className="text-2xl cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                      onClick={() => download(action)}
                    />
                  )}
                  <MdClose
                    className="text-xl cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                    onClick={() => deleteAction(action)}
                  />
                </div>
              </div>
            ))}
            <div className="flex items-center gap-4 justify-end">
              {
                actions.filter(action => !action.is_converted).length > 0 && (
                  <Button
                    onClick={convert}
                    className={`w-64`}
                  >
                    {isConverting ? "Convertion en cours..." : "Convertir"}
                  </Button>
                )
              }
              {
                isDone && (
                  <Button
                    onClick={downloadAll}
                    className="bg-green-600 hover:bg-green-600/80 w-64"
                  >
                    {
                      actions.filter(action => action.is_converted).length > 1
                        ? "Télécharger tout"
                        : "Télécharger"
                    }
                  </Button>
                )
              }
            </div>
          </div>
        ) : null
      }
    </>
  );
}