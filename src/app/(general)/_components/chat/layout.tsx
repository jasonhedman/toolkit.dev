interface Props {
  children: React.ReactNode;
}

export const ChatLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="flex h-0 flex-1 flex-col overflow-hidden">{children}</div>
  );
};
