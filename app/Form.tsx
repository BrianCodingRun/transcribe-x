import React from 'react'

type FormProps = {
  className?: string,
  onSubmit?: React.FormEventHandler<HTMLFormElement>,
  children?: React.ReactNode,
};

export const Form = (props: FormProps) => {
  return (
    <form className='flex flex-col items-center gap-2' {...props}>
      {props.children}
    </form>
  )
}
