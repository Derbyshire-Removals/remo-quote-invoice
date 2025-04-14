
                <TableCell>
                  <Button
                    variant="ghost" 
                    className="p-1 h-7"
                    onClick={() => onToggleReviewStatus && onToggleReviewStatus(invoice)}
                    title={invoice.hasReview ? 'Remove review status' : 'Mark as reviewed'}
                  >
                    <Star 
                      className={`h-5 w-5 ${invoice.hasReview ? 'text-yellow-500' : 'text-slate-400'}`}
                      fill={invoice.hasReview ? "currentColor" : "none"}
                      stroke={invoice.hasReview ? "#f59e0b" : "currentColor"}
                    />
                  </Button>
                </TableCell>
