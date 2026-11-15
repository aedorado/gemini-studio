#import <Foundation/Foundation.h>
#import <PDFKit/PDFKit.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSString *pdfPath = @"/Users/anurag/pworkspace/astro-tools/reference_books/ahtmd_mehta.pdf";
        NSURL *url = [NSURL fileURLWithPath:pdfPath];
        PDFDocument *doc = [[PDFDocument alloc] initWithURL:url];
        if (!doc) {
            printf("Error: Could not open PDF\n");
            return 1;
        }
        NSInteger count = [doc pageCount];
        printf("Total Pages: %ld\n", (long)count);

        // Search for Chapter XV or Table of Contents
        for (NSInteger i = 0; i < count; i++) {
            PDFPage *page = [doc pageAtIndex:i];
            NSString *content = [page string];
            if (content) {
                if ([content rangeOfString:@"Chapter XV" options:NSCaseInsensitiveSearch].location != NSNotFound ||
                    [content rangeOfString:@"CHAPTER 15" options:NSCaseInsensitiveSearch].location != NSNotFound ||
                    [content rangeOfString:@"Contents" options:NSCaseInsensitiveSearch].location != NSNotFound) {
                    printf("Match on page %ld:\n", (long)(i + 1));
                    // print first 200 chars
                    NSString *preview = [content length] > 300 ? [content substringToIndex:300] : content;
                    printf("%s\n---\n", [preview UTF8String]);
                }
            }
        }
    }
    return 0;
}
